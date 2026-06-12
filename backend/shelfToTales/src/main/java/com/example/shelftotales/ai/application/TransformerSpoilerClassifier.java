package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.domain.SpoilerSentence;
import ai.onnxruntime.*;
import ai.djl.huggingface.tokenizers.Encoding;
import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Transformer-based spoiler classifier using ONNX Runtime for inference.
 * Classifies review text into spoiler levels (SAFE, MINOR_SPOILER, MAJOR_SPOILER)
 * by running a DistilBERT-family model exported to ONNX format.
 *
 * <p>The classifier takes the model output (a 3-class softmax) and also runs a
 * per-sentence pass so redaction targets the sentences that actually tripped
 * the model, not the whole review.
 */
@Component
@Slf4j
public class TransformerSpoilerClassifier implements SpoilerClassifier {

    private static final int MAX_TOKENS = 128;
    private static final String MODEL_ID = "transformer-distilbert-v1";

    @Value("${ai.spoiler.transformer.enabled:false}")
    private boolean enabled;

    @Value("${ai.spoiler.transformer.model-path:classpath:models/spoiler-detector.onnx}")
    private Resource modelResource;

    @Value("${ai.spoiler.transformer.tokenizer-path:classpath:models/tokenizer.json}")
    private Resource tokenizerResource;

    private final ResourceLoader resourceLoader;
    private OrtEnvironment ortEnvironment;
    private OrtSession ortSession;
    private HuggingFaceTokenizer tokenizer;
    private volatile boolean modelAvailable = false;

    private static final Pattern SENTENCE_SPLIT = Pattern.compile(
            "(?<=[.!?])\\s+(?=[A-Z\"\\u201C\\u2018])");

    public TransformerSpoilerClassifier(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Transformer spoiler classifier disabled (ai.spoiler.transformer.enabled=false)");
            return;
        }
        try {
            ortEnvironment = OrtEnvironment.getEnvironment();
            Path modelPath = getResourcePath(modelResource, "spoiler-detector-", ".onnx");
            log.info("Loading transformer spoiler model from: {}", modelPath);
            ortSession = ortEnvironment.createSession(modelPath.toString());

            Path tokenizerPath = getResourcePath(tokenizerResource, "tokenizer-", ".json");
            log.info("Loading tokenizer from: {}", tokenizerPath);
            tokenizer = HuggingFaceTokenizer.builder()
                    .optTokenizerPath(tokenizerPath)
                    .optMaxLength(MAX_TOKENS)
                    .optTruncation(true)
                    .optPadding(true)
                    .build();

            modelAvailable = true;
            log.info("Transformer spoiler classifier loaded successfully (model: {})", MODEL_ID);
        } catch (Throwable t) {
            log.warn("Failed to load transformer spoiler model \u2014 falling back to heuristic. " +
                    "Check ai.spoiler.transformer.* properties and the ONNX/tokenizer files: {}",
                    t.toString());
            modelAvailable = false;
        }
    }

    @PreDestroy
    public void cleanup() {
        try {
            if (tokenizer != null) tokenizer.close();
        } catch (Exception e) {
            log.warn("Error closing tokenizer: {}", e.getMessage());
        }
        try {
            if (ortSession != null) ortSession.close();
        } catch (Exception e) {
            log.warn("Error closing ONNX session: {}", e.getMessage());
        }
        // OrtEnvironment is process-singleton \u2014 do not close it here.
        ortEnvironment = null;
    }

    public boolean isModelAvailable() {
        return modelAvailable;
    }

    @Override
    public SpoilerAssessment classify(Long reviewId, Long userId, String text) {
        if (text == null || text.isBlank() || !modelAvailable) {
            return buildSafeAssessment(reviewId, userId, text);
        }

        try {
            long start = System.currentTimeMillis();
            float[] probabilities = runInference(text);
            SpoilerLevel level = mapToSpoilerLevel(probabilities);
            List<SpoilerSentence> spoilerSentences = identifySpoilerSentences(text, probabilities);

            long latencyMs = System.currentTimeMillis() - start;
            return SpoilerAssessment.builder()
                    .reviewId(reviewId)
                    .userId(userId)
                    .spoilerLevel(level)
                    .spoilerScore(BigDecimal.valueOf(probabilities[1] + probabilities[2]))
                    .spoilerSentences(spoilerSentences)
                    .sanitizedReview(level != SpoilerLevel.SAFE ? redactSpoilers(text, spoilerSentences) : text)
                    .model(MODEL_ID)
                    .latencyMs((int) latencyMs)
                    .build();
        } catch (Exception e) {
            log.error("Transformer spoiler classification failed for review={}: {}", reviewId, e.toString());
            return buildSafeAssessment(reviewId, userId, text);
        }
    }

    @Override
    public String modelId() {
        return MODEL_ID;
    }

    /**
     * Run a single inference pass and return softmax probabilities.
     */
    private float[] runInference(String text) throws OrtException {
        Encoding encoding = tokenizer.encode(text);
        long[] inputIds = encoding.getIds();
        long[] attentionMask = encoding.getAttentionMask();

        Map<String, OnnxTensor> inputs = new HashMap<>();
        try {
            OnnxTensor idsTensor = OnnxTensor.createTensor(ortEnvironment,
                    new long[][]{inputIds});
            OnnxTensor maskTensor = OnnxTensor.createTensor(ortEnvironment,
                    new long[][]{attentionMask});
            inputs.put("input_ids", idsTensor);
            inputs.put("attention_mask", maskTensor);

            try (OrtSession.Result result = ortSession.run(inputs)) {
                float[][] logits = (float[][]) result.get(0).getValue();
                return softmax(logits[0]);
            }
        } finally {
            for (OnnxTensor tensor : inputs.values()) {
                try { tensor.close(); } catch (Exception ignored) { /* best effort */ }
            }
        }
    }

    private SpoilerLevel mapToSpoilerLevel(float[] probabilities) {
        if (probabilities.length < 3) {
            return SpoilerLevel.SAFE;
        }
        if (probabilities[2] >= 0.7) return SpoilerLevel.MAJOR_SPOILER;
        if (probabilities[1] >= 0.3 || probabilities[2] >= 0.3) return SpoilerLevel.MINOR_SPOILER;
        return SpoilerLevel.SAFE;
    }

    private float[] softmax(float[] logits) {
        float max = Float.NEGATIVE_INFINITY;
        for (float logit : logits) {
            if (logit > max) max = logit;
        }
        double sum = 0;
        double[] exp = new double[logits.length];
        for (int i = 0; i < logits.length; i++) {
            exp[i] = Math.exp(logits[i] - max);
            sum += exp[i];
        }
        float[] result = new float[logits.length];
        for (int i = 0; i < logits.length; i++) {
            result[i] = (float) (exp[i] / sum);
        }
        return result;
    }

    /**
     * Per-sentence classification. Sentences that cross the spoiler
     * threshold are flagged; everything else is left intact.
     */
    private List<SpoilerSentence> identifySpoilerSentences(String text, float[] documentProbabilities) {
        List<SpoilerSentence> sentences = new ArrayList<>();
        float docSpoilerScore = documentProbabilities[1] + documentProbabilities[2];
        if (docSpoilerScore < 0.3) {
            return sentences;
        }
        String[] parts = SENTENCE_SPLIT.split(text);
        for (int i = 0; i < parts.length; i++) {
            String sentence = parts[i].trim();
            if (sentence.isEmpty()) continue;
            float[] sentenceProbs;
            try {
                sentenceProbs = runInference(sentence);
            } catch (Exception e) {
                log.debug("Per-sentence inference failed, using document score: {}", e.getMessage());
                sentenceProbs = documentProbabilities;
            }
            float sentenceScore = sentenceProbs[1] + sentenceProbs[2];
            if (sentenceScore > 0.5) {
                sentences.add(new SpoilerSentence(i, sentence, sentenceScore,
                        SpoilerLevel.fromScore(sentenceScore)));
            }
        }
        return sentences;
    }

    private String redactSpoilers(String text, List<SpoilerSentence> spoilerSentences) {
        String redacted = text;
        for (SpoilerSentence ss : spoilerSentences) {
            if (ss.level() == SpoilerLevel.MAJOR_SPOILER) {
                redacted = redacted.replace(ss.text(), "[SPOILER REDACTED]");
            }
        }
        return redacted;
    }

    private SpoilerAssessment buildSafeAssessment(Long reviewId, Long userId, String text) {
        return SpoilerAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spoilerLevel(SpoilerLevel.SAFE)
                .spoilerScore(BigDecimal.ZERO)
                .spoilerSentences(List.of())
                .sanitizedReview(text != null ? text : "")
                .model(MODEL_ID)
                .build();
    }

    private Path getResourcePath(Resource resource, String prefix, String suffix) throws IOException {
        try {
            return resource.getFile().toPath();
        } catch (IOException e) {
            Path tempFile = Files.createTempFile(prefix, suffix);
            try (InputStream in = resource.getInputStream()) {
                Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }
            tempFile.toFile().deleteOnExit();
            return tempFile;
        }
    }
}

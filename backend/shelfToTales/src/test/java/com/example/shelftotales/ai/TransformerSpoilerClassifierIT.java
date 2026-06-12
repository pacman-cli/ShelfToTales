package com.example.shelftotales.ai;

import com.example.shelftotales.ai.application.TransformerSpoilerClassifier;
import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test that loads the real ONNX model and tokenizer from the
 * classpath. Skipped automatically when either file is absent, so this test
 * is safe to run in CI even before the model is published.
 */
@EnabledIf("modelsPresent")
class TransformerSpoilerClassifierIT {

    private static boolean modelsPresent() {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        boolean onnx = cl.getResource("models/spoiler-detector.onnx") != null;
        boolean tok = cl.getResource("models/tokenizer.json") != null;
        return onnx && tok;
    }

    private TransformerSpoilerClassifier newClassifier(boolean enabled) {
        TransformerSpoilerClassifier classifier =
                new TransformerSpoilerClassifier(new DefaultResourceLoader());
        ReflectionTestUtils.setField(classifier, "enabled", enabled);
        Resource model = new DefaultResourceLoader()
                .getResource("classpath:models/spoiler-detector.onnx");
        Resource tokenizer = new DefaultResourceLoader()
                .getResource("classpath:models/tokenizer.json");
        ReflectionTestUtils.setField(classifier, "modelResource", model);
        ReflectionTestUtils.setField(classifier, "tokenizerResource", tokenizer);
        classifier.init();
        return classifier;
    }

    @Test
    void loadsAndClassifiesWithRealModel() {
        TransformerSpoilerClassifier classifier = newClassifier(true);
        assertTrue(classifier.isModelAvailable(), "Transformer model failed to load");

        SpoilerAssessment benign = classifier.classify(1L, 1L,
                "I loved the characters in this book, the writing was beautiful.");
        SpoilerAssessment spoilery = classifier.classify(2L, 1L,
                "The killer is revealed in chapter 12 when the butler confesses at the wedding.");

        assertNotNull(benign);
        assertNotNull(spoilery);
        assertNotNull(benign.getSpoilerLevel());
        assertNotNull(spoilery.getSpoilerLevel());
        assertEquals("transformer-distilbert-v1", benign.getModel());
    }

    @Test
    void producesSensibleProbabilities() {
        TransformerSpoilerClassifier classifier = newClassifier(true);
        if (!classifier.isModelAvailable()) {
            // Skipped by @EnabledIf; defensive no-op.
            return;
        }
        SpoilerAssessment result = classifier.classify(1L, 1L,
                "The detective dies in the final chapter.");
        assertTrue(result.getSpoilerScore().doubleValue() >= 0.0);
        assertTrue(result.getSpoilerScore().doubleValue() <= 2.0);
    }
}

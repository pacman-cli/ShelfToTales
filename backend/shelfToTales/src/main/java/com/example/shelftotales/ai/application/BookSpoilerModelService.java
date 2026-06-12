package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.BookSpoilerModel;
import com.example.shelftotales.ai.infrastructure.BookSpoilerModelRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
import java.nio.file.Files;
import java.io.FileNotFoundException;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookSpoilerModelService {

    private final BookSpoilerModelRepository modelRepository;
    private final ReviewRepository reviewRepository;
    private final TrainingDataGenerator trainingDataGenerator;
    private final RestTemplate restTemplate;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ai.spoiler.training-dir:./training-data}")
    private String trainingDir;

    @Value("${ai.spoiler.min-training-reviews:20}")
    private int minTrainingReviews;

    /**
     * Register a book for spoiler model tracking.
     * Called when a book is first uploaded.
     */
    @Transactional
    public BookSpoilerModel registerBook(Long bookId, String bookTitle) {
        return modelRepository.findByBookId(bookId).orElseGet(() -> {
            String modelName = sanitizeModelName(bookTitle, bookId);
            BookSpoilerModel model = BookSpoilerModel.builder()
                    .bookId(bookId)
                    .ollamaModelName(modelName)
                    .status(BookSpoilerModel.ModelStatus.NO_REVIEWS)
                    .build();
            log.info("Registered spoiler model tracking for book={} title='{}' model={}",
                    bookId, bookTitle, modelName);
            return modelRepository.save(model);
        });
    }

    /**
     * Check if a book has enough reviews to train a model.
     * Auto-generates training data and updates status.
     */
    @Transactional
    public Optional<BookSpoilerModel> checkTrainingReadiness(Long bookId) {
        Optional<BookSpoilerModel> modelOpt = modelRepository.findByBookId(bookId);
        if (modelOpt.isEmpty()) {
            return Optional.empty();
        }

        BookSpoilerModel model = modelOpt.get();

        // Already trained or training in progress - skip
        if (model.getStatus() == BookSpoilerModel.ModelStatus.ACTIVE
                || model.getStatus() == BookSpoilerModel.ModelStatus.TRAINING
                || model.getStatus() == BookSpoilerModel.ModelStatus.READY_TO_TRAIN) {
            return Optional.of(model);
        }

        // Count reviews with spoiler labels (non-null spoilerLevel indicates AI has assessed it)
        long labeledReviewCount = reviewRepository.countByBookIdAndSpoilerLevelIsNotNull(bookId);

        if (labeledReviewCount < minTrainingReviews) {
            model.setStatus(BookSpoilerModel.ModelStatus.COLLECTING_DATA);
            model.setTrainingExampleCount((int) labeledReviewCount);
            modelRepository.save(model);
            log.info("Book {} has {}/{} labeled reviews - collecting data",
                    bookId, labeledReviewCount, minTrainingReviews);
            return Optional.of(model);
        }

        // Enough reviews - generate training data and mark ready
        model.setStatus(BookSpoilerModel.ModelStatus.READY_TO_TRAIN);
        model.setTrainingExampleCount((int) labeledReviewCount);

        // Generate the JSONL training file
        try {
            String jsonlPath = trainingDataGenerator.generateForBook(bookId);
            model.setTrainingJsonlPath(jsonlPath);
            log.info("Book {} ready for training with {} reviews. JSONL: {}",
                    bookId, labeledReviewCount, jsonlPath);
        } catch (Exception e) {
            log.error("Failed to generate training data for book {}", bookId, e);
        }

        modelRepository.save(model);
        return Optional.of(model);
    }

    /**
     * Update model status after training completes.
     */
    @Transactional
    public void markTrainingComplete(Long bookId, String ggufDriveFileId) {
        modelRepository.findByBookId(bookId).ifPresent(model -> {
            model.setStatus(BookSpoilerModel.ModelStatus.ACTIVE);
            model.setGgufDriveFileId(ggufDriveFileId);
            model.setLastTrainedAt(java.time.Instant.now());
            model.setModelVersion("v" + System.currentTimeMillis());
            modelRepository.save(model);
            log.info("Model training complete for book={}: model={}", bookId, model.getOllamaModelName());
        });
    }

    /**
     * Mark model training as failed.
     */
    @Transactional
    public void markTrainingFailed(Long bookId, String reason) {
        modelRepository.findByBookId(bookId).ifPresent(model -> {
            model.setStatus(BookSpoilerModel.ModelStatus.TRAINING_FAILED);
            modelRepository.save(model);
            log.warn("Model training failed for book={}: {}", bookId, reason);
        });
    }

    /**
     * Get the Ollama model name for a book.
     * Returns the fine-tuned model name if ACTIVE, or the generic fallback.
     */
    public String getModelName(Long bookId) {
        return modelRepository.findByBookIdAndStatus(bookId, BookSpoilerModel.ModelStatus.ACTIVE)
                .map(BookSpoilerModel::getOllamaModelName)
                .orElse("shelf-spoiler-detector");
    }

    /**
     * Check if a book has an active fine-tuned model.
     */
    public boolean hasActiveModel(Long bookId) {
        return modelRepository.existsByBookIdAndStatus(bookId, BookSpoilerModel.ModelStatus.ACTIVE);
    }

    /**
     * Get model info for a book.
     */
    public Optional<BookSpoilerModel> getModel(Long bookId) {
        return modelRepository.findByBookId(bookId);
    }

    /**
     * Get all books that need training.
     */
    public List<BookSpoilerModel> getBooksNeedingTraining() {
        return modelRepository.findBooksNeedingTraining();
    }

    /**
     * Sanitize book title to create a valid Ollama model name.
     * e.g., "The Great Gatsby" -> "shelf-spoiler-book-42"
     */
    private String sanitizeModelName(String title, Long bookId) {
        return "shelf-spoiler-book-" + bookId;
    }

    /**
     * Locate local GGUF file and Modelfile (if exists), then register model in Ollama.
     */
    public void importModelToOllama(Long bookId) throws Exception {
        BookSpoilerModel model = modelRepository.findByBookId(bookId)
                .orElseThrow(() -> new IllegalArgumentException("No spoiler model registered for book: " + bookId));

        Path modelFolder = Path.of(trainingDir, "models", bookId.toString());
        if (!Files.exists(modelFolder) || !Files.isDirectory(modelFolder)) {
            throw new FileNotFoundException("Model directory does not exist locally: " + modelFolder.toAbsolutePath());
        }

        Path ggufPath;
        try (Stream<Path> files = Files.list(modelFolder)) {
            ggufPath = files
                    .filter(p -> p.toString().endsWith(".gguf"))
                    .findFirst()
                    .orElseThrow(() -> new FileNotFoundException("No GGUF file found in directory: " + modelFolder.toAbsolutePath()));
        }

        String modelName = model.getOllamaModelName();
        String absoluteGgufPath = ggufPath.toAbsolutePath().toString();

        log.info("Found GGUF file for book {} at {}", bookId, absoluteGgufPath);

        // Construct Modelfile contents with absolute path
        String modelfileContent = String.format(
                "FROM %s\n\n" +
                "TEMPLATE \"\"\"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n" +
                "You are a spoiler detection model. Classify book reviews as:\n" +
                "- SAFE: No spoilers\n" +
                "- MINOR_SPOILER: Hints about plot or characters\n" +
                "- MAJOR_SPOILER: Reveals key plot points, endings, or character deaths\n\n" +
                "You MUST respond with ONLY valid JSON:\n" +
                "{\n" +
                "  \"level\": \"SAFE\" | \"MINOR_SPOILER\" | \"MAJOR_SPOILER\",\n" +
                "  \"score\": 0.0-1.0,\n" +
                "  \"reasoning\": \"brief explanation\"\n" +
                "}<|eot_id|><|start_header_id|>user<|end_header_id|>\n" +
                "Analyze this review for spoilers:\n" +
                "{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n" +
                "\"\"\"\n\n" +
                "PARAMETER temperature 0.1\n" +
                "PARAMETER num_predict 200\n" +
                "PARAMETER top_p 0.9\n",
                absoluteGgufPath
        );

        java.util.Map<String, Object> payload = java.util.Map.of(
                "model", modelName,
                "modelfile", modelfileContent,
                "stream", false
        );

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(payload, headers);

        String createUrl = ollamaBaseUrl + "/api/create";
        log.info("Sending request to Ollama to create model {} at {}", modelName, createUrl);

        ResponseEntity<String> response = restTemplate.postForEntity(createUrl, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("Successfully registered model {} in Ollama", modelName);
        } else {
            throw new RuntimeException("Ollama model creation failed with status: " + response.getStatusCode() + " body: " + response.getBody());
        }
    }
}

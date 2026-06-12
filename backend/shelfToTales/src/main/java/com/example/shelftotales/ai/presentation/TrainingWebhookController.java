package com.example.shelftotales.ai.presentation;

import com.example.shelftotales.ai.application.BookSpoilerModelService;
import com.example.shelftotales.ai.application.SpoilerModelRegistry;
import com.example.shelftotales.ai.application.TrainingDataGenerator;
import com.example.shelftotales.ai.application.TrainingTriggerService;
import com.example.shelftotales.ai.domain.BookSpoilerModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

/**
 * Webhook endpoint for Colab to notify when training is complete.
 * Colab calls this endpoint after exporting the GGUF model.
 */
@RestController
@RequestMapping("/api/ai/webhooks")
@RequiredArgsConstructor
@Slf4j
public class TrainingWebhookController {

    private final BookSpoilerModelService modelService;
    private final SpoilerModelRegistry modelRegistry;
    private final TrainingDataGenerator trainingDataGenerator;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${ai.spoiler.training-dir:./training-data}")
    private String trainingDir;

    /**
     * Colab calls this when training completes.
     * Body: { "bookId": 123, "modelName": "shelf-spoiler-book-123", "ggufDriveFileId": "..." }
     */
    @PostMapping("/training-complete")
    public ResponseEntity<Map<String, Object>> onTrainingComplete(
            @RequestBody Map<String, Object> payload) {

        Long bookId = ((Number) payload.get("bookId")).longValue();
        String modelName = (String) payload.get("modelName");
        String ggufDriveFileId = (String) payload.get("ggufDriveFileId");

        log.info("Training complete notification for book={}: model={}", bookId, modelName);

        // Update the model status
        modelService.markTrainingComplete(bookId, ggufDriveFileId);

        // Invalidate the cache so the new model is used
        modelRegistry.invalidate(bookId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("modelName", modelName);

        // Attempt automatic import into Ollama
        try {
            modelService.importModelToOllama(bookId);
            response.put("message", "Model registered and imported into Ollama successfully");
        } catch (Exception e) {
            log.warn("Automatic Ollama import failed for book {}: {}", bookId, e.getMessage());
            response.put("status", "warning");
            response.put("message", "Model registered in DB, but local import to Ollama failed: " + e.getMessage() 
                    + ". Sync/copy the GGUF file locally and call /import-model endpoint.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Colab calls this when training fails.
     * Body: { "bookId": 123, "reason": "..." }
     */
    @PostMapping("/training-failed")
    public ResponseEntity<Map<String, Object>> onTrainingFailed(
            @RequestBody Map<String, Object> payload) {

        Long bookId = ((Number) payload.get("bookId")).longValue();
        String reason = (String) payload.getOrDefault("reason", "Unknown error");

        log.warn("Training failed for book={}: {}", bookId, reason);

        modelService.markTrainingFailed(bookId, reason);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Training failure recorded for book " + bookId
        ));
    }

    /**
     * Get the status of a book's spoiler model.
     */
    @GetMapping("/books/{bookId}/model-status")
    public ResponseEntity<Map<String, Object>> getModelStatus(@PathVariable Long bookId) {
        return modelService.getModel(bookId)
                .map(model -> {
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("bookId", model.getBookId());
                    response.put("modelName", model.getOllamaModelName());
                    response.put("status", model.getStatus().name());
                    response.put("trainingExampleCount", model.getTrainingExampleCount() != null ? model.getTrainingExampleCount() : 0);
                    response.put("lastTrainedAt", model.getLastTrainedAt() != null ? model.getLastTrainedAt().toString() : null);
                    response.put("hasActiveModel", model.getStatus() == BookSpoilerModel.ModelStatus.ACTIVE);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.ok(Map.of(
                        "bookId", bookId,
                        "status", "NOT_REGISTERED",
                        "hasActiveModel", false
                )));
    }

    /**
     * Manually register a book for spoiler model tracking.
     */
    @PostMapping("/books/{bookId}/register")
    public ResponseEntity<Map<String, Object>> registerBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "") String title) {
        var model = modelService.registerBook(bookId, title.isEmpty() ? "Book " + bookId : title);
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Book registered for spoiler model tracking",
                "bookId", model.getBookId(),
                "modelName", model.getOllamaModelName(),
                "status_model", model.getStatus().name()
        ));
    }

    /**
     * Manually trigger training readiness check for a book.
     */
    @PostMapping("/books/{bookId}/check-training")
    public ResponseEntity<Map<String, Object>> checkTrainingReadiness(@PathVariable Long bookId) {
        // Auto-register if not already registered
        modelService.registerBook(bookId, "Book " + bookId);
        modelService.checkTrainingReadiness(bookId);
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Training readiness check triggered for book " + bookId
        ));
    }

    /**
     * Fetch training data (JSONL) for a book directly from the backend.
     * Colab calls this to get training data without manual file upload.
     */
    @GetMapping("/books/{bookId}/training-data")
    public ResponseEntity<?> getTrainingData(@PathVariable Long bookId) {
        // First, try to read existing JSONL file
        Path jsonlPath = Path.of(trainingDir, "spoiler-train-" + bookId + ".jsonl");

        if (Files.exists(jsonlPath)) {
            try {
                List<String> lines = Files.readAllLines(jsonlPath);
                List<Map<String, Object>> examples = new ArrayList<>();
                for (String line : lines) {
                    if (line != null && !line.isBlank()) {
                        Map<String, Object> example = objectMapper.readValue(line, Map.class);
                        examples.add(example);
                    }
                }
                return ResponseEntity.ok(Map.of(
                        "bookId", bookId,
                        "exampleCount", examples.size(),
                        "examples", examples
                ));
            } catch (Exception e) {
                log.error("Failed to read training data for book {}: {}", bookId, e.getMessage());
            }
        }

        // If no file exists, try to generate it
        try {
            String path = trainingDataGenerator.generateForBook(bookId);
            List<String> lines = Files.readAllLines(Path.of(path));
            List<Map<String, Object>> examples = new ArrayList<>();
            for (String line : lines) {
                if (line != null && !line.isBlank()) {
                    Map<String, Object> example = objectMapper.readValue(line, Map.class);
                    examples.add(example);
                }
            }
            return ResponseEntity.ok(Map.of(
                    "bookId", bookId,
                    "exampleCount", examples.size(),
                    "examples", examples
            ));
        } catch (Exception e) {
            log.error("Failed to generate training data for book {}: {}", bookId, e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "bookId", bookId,
                    "exampleCount", 0,
                    "examples", List.of(),
                    "message", "No training data available. Add more reviews first."
            ));
        }
    }

    /**
     * Get all books that need training (for Colab polling).
     */
    @GetMapping("/books/needs-training")
    public ResponseEntity<List<Map<String, Object>>> getBooksNeedingTraining() {
        List<BookSpoilerModel> models = modelService.getBooksNeedingTraining();
        List<Map<String, Object>> result = models.stream()
                .filter(m -> m.getStatus() == BookSpoilerModel.ModelStatus.READY_TO_TRAIN)
                .map(m -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("bookId", m.getBookId());
                    map.put("modelName", m.getOllamaModelName());
                    map.put("status", m.getStatus().name());
                    map.put("trainingExampleCount", m.getTrainingExampleCount());
                    map.put("trainingJsonlPath", m.getTrainingJsonlPath());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    /**
     * Manually trigger model import into Ollama for a book.
     */
    @PostMapping("/books/{bookId}/import-model")
    public ResponseEntity<Map<String, Object>> importModel(@PathVariable Long bookId) {
        try {
            modelService.importModelToOllama(bookId);
            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "message", "Successfully imported model into Ollama for book " + bookId
            ));
        } catch (Exception e) {
            log.error("Failed to manually import model for book {}: {}", bookId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to import model: " + e.getMessage()
            ));
        }
    }
}

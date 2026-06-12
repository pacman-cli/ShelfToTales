package com.example.shelftotales.ai.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Integration with Google Colab for model training.
 * Triggers Colab notebooks via webhook when training data is ready.
 *
 * Workflow:
 * 1. Training JSONL is generated locally
 * 2. JSONL is uploaded to Google Drive (via Drive API or manual)
 * 3. This service triggers the Colab notebook via webhook
 * 4. Colab trains the model, exports GGUF, uploads to Drive
 * 5. Backend polls for completion and downloads the model
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ColabTrainingService {

    private final RestTemplate restTemplate;

    @Value("${ai.spoiler.colab.webhook-url:}")
    private String colabWebhookUrl;

    @Value("${ai.spoiler.colab.enabled:false}")
    private boolean colabEnabled;

    @Value("${ai.spoiler.colab.drive-folder:shelftotales-training}")
    private String driveFolder;

    /**
     * Trigger Colab training for a book.
     *
     * @param bookId the book ID
     * @param modelName the Ollama model name to create
     * @param trainingDataPath path to the JSONL training file
     * @return true if triggered successfully
     */
    public boolean triggerTraining(Long bookId, String modelName, String trainingDataPath) {
        if (!colabEnabled) {
            log.info("Colab training disabled. Book {} ready for manual training.", bookId);
            return false;
        }

        if (colabWebhookUrl == null || colabWebhookUrl.isBlank()) {
            log.warn("Colab webhook URL not configured. Book {} needs manual training.", bookId);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = Map.of(
                    "book_id", bookId,
                    "model_name", modelName,
                    "training_data_path", trainingDataPath,
                    "drive_folder", driveFolder,
                    "epochs", 3,
                    "learning_rate", 2e-4
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    colabWebhookUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Triggered Colab training for book {}: model={}", bookId, modelName);
                return true;
            } else {
                log.warn("Colab webhook returned {}: {}", response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("Failed to trigger Colab training for book {}: {}", bookId, e.getMessage());
            return false;
        }
    }

    /**
     * Check if training is complete by polling Google Drive.
     *
     * @param bookId the book ID
     * @return the GGUF file path if available, null otherwise
     */
    public String checkTrainingStatus(Long bookId) {
        if (!colabEnabled) {
            return null;
        }

        // This would poll the Google Drive API or a status endpoint
        // For now, return null (manual check required)
        log.debug("Checking training status for book {} - manual check required", bookId);
        return null;
    }

    /**
     * Generate Colab notebook URL for manual training.
     */
    public String getColabNotebookUrl(Long bookId, String modelName) {
        return String.format(
                "https://colab.research.google.com/drive/YOUR_NOTEBOOK_ID#bookId=%d&modelName=%s",
                bookId, modelName
        );
    }

    public boolean isColabEnabled() {
        return colabEnabled;
    }
}

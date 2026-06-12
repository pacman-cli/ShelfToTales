package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.domain.SpoilerSentence;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Book-specific spoiler classifier that calls a fine-tuned Ollama model.
 * Each book can have its own model trained on that book's specific reviews.
 */
@Component
@ConditionalOnProperty(name = "ai.spoiler.provider", havingValue = "book-llm")
@RequiredArgsConstructor
@Slf4j
public class BookSpoilerClassifier implements SpoilerClassifier {

    private static final int MAX_TEXT_CHARS = 4000;
    private static final String MODEL_ID_PREFIX = "book-llm-";

    private final SpoilerModelRegistry modelRegistry;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Override
    public SpoilerAssessment classify(Long reviewId, Long userId, String text) {
        if (text == null || text.isBlank()) {
            return emptyAssessment(reviewId, userId);
        }

        String trimmed = text.length() > MAX_TEXT_CHARS ? text.substring(0, MAX_TEXT_CHARS) : text;

        // Determine which book this review belongs to
        // The reviewId is passed, but we need the bookId
        // This will be resolved by SpoilerDetectionService which knows the bookId
        String modelName = modelRegistry.getCurrentModelName();

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", modelName,
                    "prompt", trimmed,
                    "stream", false,
                    "options", Map.of(
                            "temperature", 0.1,
                            "num_predict", 200,
                            "top_p", 0.9
                    )
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    ollamaBaseUrl + "/api/generate",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseOllamaResponse(reviewId, userId, response.getBody(), modelName);
            }

            log.warn("Ollama returned non-2xx for book model {}: {}", modelName, response.getStatusCode());
            return emptyAssessment(reviewId, userId);

        } catch (Exception e) {
            log.warn("Book-specific classifier failed for model {}: {}", modelName, e.getMessage());
            return emptyAssessment(reviewId, userId);
        }
    }

    @Override
    public String modelId() {
        return MODEL_ID_PREFIX + modelRegistry.getCurrentModelName();
    }

    private SpoilerAssessment parseOllamaResponse(Long reviewId, Long userId,
                                                    String responseBody, String modelName) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String responseText = root.path("response").asText("");

            // Extract JSON from the response (may be wrapped in markdown or prose)
            String json = extractJson(responseText);
            if (json == null) {
                log.warn("No JSON found in Ollama response: {}", responseText);
                return emptyAssessment(reviewId, userId);
            }

            JsonNode parsed = objectMapper.readTree(json);

            SpoilerLevel level = SpoilerLevel.valueOf(
                    parsed.path("level").asText("SAFE"));
            double score = parsed.path("score").asDouble(0.0);
            String reasoning = parsed.path("reasoning").asText("");

            // Build per-sentence assessments from the reasoning
            List<SpoilerSentence> sentences = new ArrayList<>();
            if (reasoning.contains(";")) {
                String[] parts = reasoning.split(";");
                for (int i = 0; i < parts.length; i++) {
                    sentences.add(new SpoilerSentence(i, parts[i].trim(), score, level));
                }
            } else {
                sentences.add(new SpoilerSentence(0, reasoning, score, level));
            }

            String sanitized = parsed.path("sanitized").asText("");

            return SpoilerAssessment.builder()
                    .reviewId(reviewId)
                    .userId(userId)
                    .spoilerLevel(level)
                    .spoilerScore(BigDecimal.valueOf(score))
                    .spoilerSentences(sentences)
                    .sanitizedReview(sanitized)
                    .model(modelName)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Ollama response: {}", e.getMessage());
            return emptyAssessment(reviewId, userId);
        }
    }

    private String extractJson(String text) {
        // Try to find JSON object in the response
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return null;
    }

    private SpoilerAssessment emptyAssessment(Long reviewId, Long userId) {
        return SpoilerAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spoilerLevel(SpoilerLevel.SAFE)
                .spoilerScore(BigDecimal.ZERO)
                .spoilerSentences(List.of())
                .sanitizedReview("")
                .model(modelId())
                .build();
    }
}

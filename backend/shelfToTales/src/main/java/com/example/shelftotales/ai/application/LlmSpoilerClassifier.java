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
import java.math.RoundingMode;
import java.util.*;

/**
 * LLM-backed spoiler classifier that asks an OpenAI-compatible endpoint for a
 * structured JSON verdict. Falls back to a SAFE classification on any error
 * (caller is expected to chain with the heuristic classifier on failure).
 */
@Component
@ConditionalOnProperty(name = "ai.spoiler.provider", havingValue = "llm")
@RequiredArgsConstructor
@Slf4j
public class LlmSpoilerClassifier implements SpoilerClassifier {

    private static final int MAX_TEXT_CHARS = 4000;
    private static final String SYSTEM_PROMPT = """
            You are a spoiler-detection model. Classify the user's review text.
            Respond with a single JSON object, no prose, no markdown fences.

            Schema:
            {
              "level": "SAFE" | "MINOR_SPOILER" | "MAJOR_SPOILER",
              "score": number in [0, 1],
              "sentences": [
                { "index": 0, "text": "...", "score": number, "level": "SAFE"|"MINOR_SPOILER"|"MAJOR_SPOILER" }
              ],
              "sanitized": "the review with MAJOR_SPOILER sentences replaced by [REDACTED]"
            }
            """;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.chat.api-key:}")
    private String apiKey;

    @Value("${ai.chat.model:meta-llama/llama-3.1-8b-instruct:free}")
    private String model;

    @Value("${ai.chat.base-url:https://openrouter.ai/api/v1/chat/completions}")
    private String baseUrl;

    @Override
    public SpoilerAssessment classify(Long reviewId, Long userId, String text) {
        if (text == null || text.isBlank()) {
            return emptyAssessment(reviewId, userId);
        }
        String trimmed = text.length() > MAX_TEXT_CHARS ? text.substring(0, MAX_TEXT_CHARS) : text;
        try {
            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", "Classify this review:\n\n" + trimmed)
            );
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", messages,
                    "max_tokens", 600,
                    "temperature", 0.0,
                    "response_format", Map.of("type", "json_object")
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.setBearerAuth(apiKey);
            }
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            String content = extractContent(response.getBody());
            return parse(reviewId, userId, content);
        } catch (Exception e) {
            log.warn("LLM spoiler classifier failed, returning SAFE placeholder: {}", e.getMessage());
            return emptyAssessment(reviewId, userId);
        }
    }

    @Override
    public String modelId() {
        return "openrouter-" + model;
    }

    @SuppressWarnings("unchecked")
    private String extractContent(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode content = root.path("choices").path(0).path("message").path("content");
        return content.isMissingNode() ? null : content.asText();
    }

    private SpoilerAssessment parse(Long reviewId, Long userId, String content) throws Exception {
        JsonNode root = objectMapper.readTree(content);
        SpoilerLevel level = SpoilerLevel.valueOf(root.path("level").asText("SAFE"));
        double score = clamp(root.path("score").asDouble(0.0));
        String sanitized = root.path("sanitized").asText("");
        List<SpoilerSentence> sentences = new ArrayList<>();
        for (JsonNode s : root.path("sentences")) {
            sentences.add(new SpoilerSentence(
                    s.path("index").asInt(),
                    s.path("text").asText(""),
                    clamp(s.path("score").asDouble(0.0)),
                    SpoilerLevel.valueOf(s.path("level").asText("SAFE"))
            ));
        }
        return SpoilerAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spoilerLevel(level)
                .spoilerScore(BigDecimal.valueOf(round3(score)))
                .spoilerSentences(sentences)
                .sanitizedReview(sanitized)
                .model(modelId())
                .build();
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

    private static double clamp(double v) {
        if (Double.isNaN(v)) return 0.0;
        if (v < 0) return 0;
        if (v > 1) return 1;
        return v;
    }

    private static double round3(double v) {
        return BigDecimal.valueOf(v).setScale(3, RoundingMode.HALF_UP).doubleValue();
    }
}

package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpamAssessment;
import com.example.shelftotales.ai.domain.SpamLevel;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "ai.spam.provider", havingValue = "llm")
@RequiredArgsConstructor
@Slf4j
public class LlmSpamClassifier implements SpamClassifier {

    private static final int MAX_TEXT_CHARS = 4000;

    private static final String SYSTEM_PROMPT = """
            You are a spam detection system for a book review platform called Shelf to Tales.
            Analyze the user review text and classify it as one of: SAFE, SUSPECTED_SPAM, or SPAM.

            Spam indicators include:
            - Promotional content (buy links, discount codes, affiliate links)
            - Nonsensical or gibberish text
            - Repeated character patterns (aaaa, !!!!!!, etc.)
            - Off-topic content unrelated to books or reading
            - Bot-like patterns (templates, generic praise without substance)
            - Excessive ALL CAPS or excessive punctuation
            - URL-heavy text or promotional language

            Respond with a single JSON object, no prose, no markdown fences.

            Schema:
            {
              "level": "SAFE" | "SUSPECTED_SPAM" | "SPAM",
              "score": number in [0, 1],
              "reasons": ["list of reasons why flagged, empty if SAFE"]
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
    public SpamAssessment classify(Long reviewId, Long userId, String text) {
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
                    "max_tokens", 300,
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
            log.warn("LLM spam classifier failed, returning SAFE placeholder: {}", e.getMessage());
            return emptyAssessment(reviewId, userId);
        }
    }

    @Override
    public String modelId() {
        return "openrouter-" + model;
    }

    private String extractContent(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode content = root.path("choices").path(0).path("message").path("content");
        return content.isMissingNode() ? null : content.asText();
    }

    private SpamAssessment parse(Long reviewId, Long userId, String content) throws Exception {
        JsonNode root = objectMapper.readTree(content);
        SpamLevel level = SpamLevel.valueOf(root.path("level").asText("SAFE"));
        double score = clamp(root.path("score").asDouble(0.0));
        List<String> reasons = new ArrayList<>();
        for (JsonNode r : root.path("reasons")) {
            reasons.add(r.asText(""));
        }
        return SpamAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spamLevel(level)
                .spamScore(BigDecimal.valueOf(round3(score)))
                .spamReasons(reasons)
                .model(modelId())
                .build();
    }

    private SpamAssessment emptyAssessment(Long reviewId, Long userId) {
        return SpamAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spamLevel(SpamLevel.SAFE)
                .spamScore(BigDecimal.ZERO)
                .spamReasons(List.of())
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

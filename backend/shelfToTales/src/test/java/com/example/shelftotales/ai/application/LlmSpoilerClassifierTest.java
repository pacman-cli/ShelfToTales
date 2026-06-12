package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LlmSpoilerClassifierTest {

    @Mock private RestTemplate restTemplate;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private LlmSpoilerClassifier classifier;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(classifier, "apiKey", "test-key");
        ReflectionTestUtils.setField(classifier, "model", "test-model");
        ReflectionTestUtils.setField(classifier, "baseUrl", "http://test.com");
    }

    @Test
    void returnsEmpty_whenTextIsBlank() {
        SpoilerAssessment result = classifier.classify(1L, 10L, "");
        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
        assertEquals(BigDecimal.ZERO, result.getSpoilerScore());
    }

    @Test
    void parsesMajorSpoiler_fromLlmResponse() throws Exception {
        String llmJson = "{\"level\":\"MAJOR_SPOILER\",\"score\":0.95,\"sentences\":[{\"index\":0,\"text\":\"He dies\",\"score\":0.95,\"level\":\"MAJOR_SPOILER\"}],\"sanitized\":\"[REDACTED]\"}";
        String wrappedResponse = "{\"choices\":[{\"message\":{\"content\":\"" + llmJson.replace("\"", "\\\"") + "\"}}]}";

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(wrappedResponse, HttpStatus.OK));

        SpoilerAssessment result = classifier.classify(1L, 10L, "He dies at the end");

        assertEquals(SpoilerLevel.MAJOR_SPOILER, result.getSpoilerLevel());
        assertEquals(0.95f, result.getSpoilerScore().floatValue(), 0.01f);
    }

    @Test
    void returnsSafe_whenLlmCallFails() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        SpoilerAssessment result = classifier.classify(1L, 10L, "Some review");

        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
        assertEquals(BigDecimal.ZERO, result.getSpoilerScore());
    }

    @Test
    void returnsSafe_whenResponseIsNull() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.OK));

        SpoilerAssessment result = classifier.classify(1L, 10L, "Some review");

        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
    }
}

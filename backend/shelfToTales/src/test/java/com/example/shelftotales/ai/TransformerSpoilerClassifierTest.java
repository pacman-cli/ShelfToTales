package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class TransformerSpoilerClassifierTest {

    private final TransformerSpoilerClassifier classifier =
            new TransformerSpoilerClassifier(new DefaultResourceLoader());

    @Test
    void returnsSafe_whenDisabled() {
        ReflectionTestUtils.setField(classifier, "enabled", false);
        classifier.init();

        SpoilerAssessment result = classifier.classify(1L, 10L, "The killer is revealed");

        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
        assertFalse(classifier.isModelAvailable());
    }

    @Test
    void returnsSafe_whenTextIsNull() {
        ReflectionTestUtils.setField(classifier, "enabled", false);
        classifier.init();

        SpoilerAssessment result = classifier.classify(1L, 10L, null);

        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
    }

    @Test
    void modelIdReturnsCorrectValue() {
        assertEquals("transformer-distilbert-v1", classifier.modelId());
    }
}

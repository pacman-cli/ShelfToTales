package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HeuristicSpoilerClassifierTest {

    private final HeuristicSpoilerClassifier classifier = new HeuristicSpoilerClassifier();

    @Test
    void classifiesMajorSpoiler_whenKillerRevealed() {
        SpoilerAssessment result = classifier.classify(1L, 10L,
                "I loved this book! The killer is the butler. What a twist!");
        assertEquals(SpoilerLevel.MAJOR_SPOILER, result.getSpoilerLevel());
        assertTrue(result.getSpoilerScore().doubleValue() >= 0.7);
        assertNotNull(result.getSanitizedReview());
        assertTrue(result.getSanitizedReview().contains("[REDACTED]"));
    }

    @Test
    void classifiesMajorSpoiler_whenCharacterDies() {
        SpoilerAssessment result = classifier.classify(2L, 10L,
                "Harry dies in chapter 5. I was so sad. Otherwise a great read.");
        assertEquals(SpoilerLevel.MAJOR_SPOILER, result.getSpoilerLevel());
    }

    @Test
    void classifiesSafe_whenNoSpoilerKeywords() {
        SpoilerAssessment result = classifier.classify(3L, 10L,
                "I loved the characters and the world building. Highly recommend.");
        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
        assertEquals(0.0, result.getSpoilerScore().doubleValue(), 0.001);
    }

    @Test
    void classifiesMinorSpoiler_whenSoftKeyword() {
        SpoilerAssessment result = classifier.classify(4L, 10L,
                "There are some death themes but nothing too heavy.");
        // "death" alone should land in MINOR, not MAJOR.
        assertTrue(result.getSpoilerLevel() == SpoilerLevel.MINOR_SPOILER
                || result.getSpoilerLevel() == SpoilerLevel.SAFE);
    }

    @Test
    void handlesEmptyText() {
        SpoilerAssessment result = classifier.classify(5L, 10L, "");
        assertEquals(SpoilerLevel.SAFE, result.getSpoilerLevel());
        assertTrue(result.getSpoilerSentences().isEmpty());
    }

    @Test
    void producesSentenceLevelTags() {
        SpoilerAssessment result = classifier.classify(6L, 10L,
                "Great pacing and characters. The killer is the butler. Loved the ending.");
        assertEquals(3, result.getSpoilerSentences().size());
        assertEquals(SpoilerLevel.MAJOR_SPOILER, result.getSpoilerSentences().get(1).level());
    }

    @Test
    void sanitizesOnlyMajorSentences() {
        SpoilerAssessment result = classifier.classify(7L, 10L,
                "Beautiful writing. The killer is the butler. A lovely ending.");
        // Only the middle sentence is redacted.
        assertTrue(result.getSanitizedReview().contains("[REDACTED]"));
        assertTrue(result.getSanitizedReview().contains("Beautiful writing"));
        assertTrue(result.getSanitizedReview().contains("A lovely ending"));
    }
}

package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;

public interface SpoilerClassifier {
    /**
     * Classify the given review text for spoiler content.
     *
     * @return a fully populated {@link SpoilerAssessment}; never null.
     */
    SpoilerAssessment classify(Long reviewId, Long userId, String text);

    /**
     * A short identifier of the underlying model (e.g. "heuristic-v1", "openrouter-llama-3.1-8b").
     */
    String modelId();
}

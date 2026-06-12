package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpamAssessment;

public interface SpamClassifier {

    SpamAssessment classify(Long reviewId, Long userId, String text);

    String modelId();
}

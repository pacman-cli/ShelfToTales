package com.example.shelftotales.ai.presentation;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;

public record SpoilerDetectionResponse(
        boolean spoiler,
        float confidence,
        String reason,
        SpoilerLevel level,
        String model
) {
    public static SpoilerDetectionResponse from(SpoilerAssessment assessment) {
        return new SpoilerDetectionResponse(
                assessment.getSpoilerLevel() != SpoilerLevel.SAFE,
                assessment.getSpoilerScore().floatValue(),
                buildReason(assessment),
                assessment.getSpoilerLevel(),
                assessment.getModel()
        );
    }

    private static String buildReason(SpoilerAssessment a) {
        if (a.getSpoilerLevel() == SpoilerLevel.SAFE) return "No spoilers detected";
        long majorCount = a.getSpoilerSentences().stream()
                .filter(s -> s.level() == SpoilerLevel.MAJOR_SPOILER).count();
        long minorCount = a.getSpoilerSentences().stream()
                .filter(s -> s.level() == SpoilerLevel.MINOR_SPOILER).count();
        if (majorCount > 0) return majorCount + " major spoiler(s) detected";
        if (minorCount > 0) return minorCount + " minor spoiler(s) detected";
        return "Spoiler content detected";
    }
}

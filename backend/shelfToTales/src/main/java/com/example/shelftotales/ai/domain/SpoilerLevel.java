package com.example.shelftotales.ai.domain;

public enum SpoilerLevel {
    SAFE,
    MINOR_SPOILER,
    MAJOR_SPOILER;

    public static SpoilerLevel fromScore(double score) {
        if (score >= 0.7) return MAJOR_SPOILER;
        if (score >= 0.3) return MINOR_SPOILER;
        return SAFE;
    }
}

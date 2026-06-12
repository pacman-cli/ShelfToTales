package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerSentence;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpoilerAssessmentResponse {
    private Long reviewId;
    private String spoilerLevel;
    private BigDecimal spoilerScore;
    private List<SpoilerSentence> sentences;
    private String sanitizedReview;
    private String model;
    private Integer latencyMs;
}

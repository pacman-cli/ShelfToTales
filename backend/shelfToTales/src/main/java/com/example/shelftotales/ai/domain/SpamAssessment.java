package com.example.shelftotales.ai.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spam_assessments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpamAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_id", nullable = false, unique = true)
    private Long reviewId;

    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "spam_level", nullable = false, length = 16)
    private SpamLevel spamLevel;

    @Column(name = "spam_score", nullable = false, precision = 4, scale = 3)
    private BigDecimal spamScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "spam_reasons", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> spamReasons = new ArrayList<>();

    @Column(nullable = false, length = 64)
    private String model;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

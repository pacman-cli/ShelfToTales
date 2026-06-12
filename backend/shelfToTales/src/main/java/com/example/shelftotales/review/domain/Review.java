package com.example.shelftotales.review.domain;

import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.domain.SpamLevel;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.domain.Category;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private boolean isSpoiler = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "spoiler_level", nullable = false, length = 16)
    @Builder.Default
    private SpoilerLevel spoilerLevel = SpoilerLevel.SAFE;

    @Column(nullable = false)
    @Builder.Default
    private boolean isSpam = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "spam_level", nullable = false, length = 16)
    @Builder.Default
    private SpamLevel spamLevel = SpamLevel.SAFE;

    @Column(name = "spam_score", precision = 4, scale = 3)
    @Builder.Default
    private BigDecimal spamScore = BigDecimal.ZERO;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}

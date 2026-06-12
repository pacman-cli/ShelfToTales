package com.example.shelftotales.review.application;

import com.example.shelftotales.ai.domain.SpoilerLevel;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long bookId;
    private int rating;
    private String comment;
    private boolean isSpoiler;
    private SpoilerLevel spoilerLevel;
    private Double spoilerScore;
    private String sanitizedComment;
    private LocalDateTime createdAt;
    private UserSummary user;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String profileImageUrl;
    }
}

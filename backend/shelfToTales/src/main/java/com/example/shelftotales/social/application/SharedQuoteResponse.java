package com.example.shelftotales.social.application;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class SharedQuoteResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String quoteText;
    private String explanation;
    private String themeStyle;
    private LocalDateTime createdAt;
    private UserSummary user;

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String profileImageUrl;
    }
}

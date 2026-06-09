package com.example.shelftotales.social.domain;

import com.example.shelftotales.auth.domain.User;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_feed_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityFeedItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", nullable = false, length = 30)
    private String activityType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String visibility = "PUBLIC";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("content")
    public String getContent() {
        if (activityType == null) return "";
        try {
            if (metadata != null && !metadata.isBlank()) {
                if (activityType.equals("FINISHED_BOOK")) {
                    String title = extractFromJson(metadata, "bookTitle");
                    return "completed reading \"" + title + "\"";
                } else if (activityType.equals("POSTED_REVIEW")) {
                    String title = extractFromJson(metadata, "bookTitle");
                    return "posted a review on \"" + title + "\"";
                } else if (activityType.equals("EXCHANGE_COMPLETED")) {
                    String type = extractFromJson(metadata, "type");
                    return "completed a book exchange (" + type + ")";
                } else if (activityType.equals("SHARE_QUOTE")) {
                    String title = extractFromJson(metadata, "bookTitle");
                    String text = extractFromJson(metadata, "quoteText");
                    return "shared a quote from \"" + title + "\": \"" + text + "\"";
                }
            }
        } catch (Exception e) {}
        return activityType.replace("_", " ").toLowerCase();
    }

    private String extractFromJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start != -1) {
            start += search.length();
            int end = json.indexOf("\"", start);
            if (end != -1) {
                return json.substring(start, end);
            }
        }
        return "";
    }
}

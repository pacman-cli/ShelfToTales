package com.example.shelftotales.ai.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "book_spoiler_models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSpoilerModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false, unique = true)
    private Long bookId;

    @Column(name = "ollama_model_name", nullable = false, length = 128)
    private String ollamaModelName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private ModelStatus status;

    @Column(name = "training_example_count")
    private Integer trainingExampleCount;

    @Column(name = "model_version", length = 32)
    private String modelVersion;

    @Column(name = "last_trained_at")
    private Instant lastTrainedAt;

    @Column(name = "gguf_drive_file_id", length = 256)
    private String ggufDriveFileId;

    @Column(name = "training_jsonl_path", length = 512)
    private String trainingJsonlPath;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum ModelStatus {
        NO_REVIEWS,
        COLLECTING_DATA,
        READY_TO_TRAIN,
        TRAINING,
        ACTIVE,
        TRAINING_FAILED,
        STALE
    }
}

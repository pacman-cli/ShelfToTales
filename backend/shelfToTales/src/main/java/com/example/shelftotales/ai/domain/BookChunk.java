package com.example.shelftotales.ai.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_chunks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "token_count", nullable = false)
    private Integer tokenCount;

    /** pgvector embedding as a JSON-serializable double[] when the extension is not available. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "vector(384)")
    private double[] embedding;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}

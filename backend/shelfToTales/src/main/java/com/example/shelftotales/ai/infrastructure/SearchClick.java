package com.example.shelftotales.ai.infrastructure;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "search_clicks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String query;

    @Column(nullable = false)
    private Integer position;

    @Column
    private String source;

    /**
     * Populated by the database DEFAULT now(); JPA does not write this column on insert.
     * The column is updatable=false so even an explicit re-save won't change it.
     */
    @Column(name = "ts", nullable = false, updatable = false, insertable = false)
    private Instant ts;
}
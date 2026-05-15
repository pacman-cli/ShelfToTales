package com.example.shelftotales.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shelf_books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelf_id", nullable = false)
    private Bookshelf bookshelf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private LocalDateTime addedAt;

    @Column(nullable = false)
    @Builder.Default
    private String readingStatus = "NOT_STARTED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onAdd() {
        addedAt = LocalDateTime.now();
    }
}

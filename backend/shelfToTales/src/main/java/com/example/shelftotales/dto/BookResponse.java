package com.example.shelftotales.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String coverUrl;
    private LocalDate publishedDate;
    private String categoryName;
    private Long categoryId;
    private String pdfUrl;
    private boolean previewAvailable;
    private java.math.BigDecimal price;
}

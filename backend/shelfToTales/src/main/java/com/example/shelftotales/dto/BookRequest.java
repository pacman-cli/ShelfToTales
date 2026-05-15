package com.example.shelftotales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    private String isbn;

    private String description;

    private String coverUrl;

    private LocalDate publishedDate;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String pdfUrl;

    private Boolean previewAvailable;

    private BigDecimal price;
}

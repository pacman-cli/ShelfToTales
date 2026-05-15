package com.example.shelftotales.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadBookResponse {
    private Long id;
    private String title;
    private String author;
    private String pdfUrl;
    private boolean previewAvailable;
    private String coverUrl;
}

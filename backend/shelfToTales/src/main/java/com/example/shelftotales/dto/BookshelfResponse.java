package com.example.shelftotales.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookshelfResponse {
    private Long id;
    private String name;
    private int position;
    private int bookCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

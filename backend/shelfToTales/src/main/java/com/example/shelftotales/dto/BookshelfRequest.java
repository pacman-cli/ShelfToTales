package com.example.shelftotales.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookshelfRequest {
    @Size(min = 1, max = 100, message = "Shelf name must be between 1 and 100 characters")
    private String name;

    private String theme;
}

package com.example.shelftotales.recommend;

import com.example.shelftotales.catalog.domain.Book;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Recommendation {
    private Book book;
    private double score;
    private String reason;
}

package com.example.shelftotales.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long bookId;
    private String title;
    private String author;
    private String coverUrl;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}

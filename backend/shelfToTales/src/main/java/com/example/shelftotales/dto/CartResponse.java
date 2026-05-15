package com.example.shelftotales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartResponse {
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalPrice;
}

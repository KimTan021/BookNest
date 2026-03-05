package com.kimtan.onlinebookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {

    private Long bookId;
    private String title;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
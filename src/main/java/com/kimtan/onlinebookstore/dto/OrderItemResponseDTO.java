package com.kimtan.onlinebookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDTO {

    private String bookTitle;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
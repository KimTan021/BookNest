package com.kimtan.onlinebookstore.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {

    private List<CartItemResponseDTO> items;
    private BigDecimal total;
}
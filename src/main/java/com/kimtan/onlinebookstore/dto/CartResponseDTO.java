package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Authenticated user's shopping cart")
public class CartResponseDTO {

    @Schema(description = "Items currently in the cart")
    private List<CartItemResponseDTO> items;
    @Schema(description = "Total amount for all cart items", example = "1598.00")
    private BigDecimal total;
}

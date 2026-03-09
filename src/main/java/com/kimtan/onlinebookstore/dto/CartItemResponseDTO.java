package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Line item inside a shopping cart")
public class CartItemResponseDTO {

    @Schema(description = "Book identifier", example = "12")
    private Long bookId;
    @Schema(description = "Book title", example = "Clean Code")
    private String title;
    @Schema(description = "Quantity in cart", example = "2")
    private Integer quantity;
    @Schema(description = "Unit price", example = "799.00")
    private BigDecimal price;
    @Schema(description = "Line subtotal", example = "1598.00")
    private BigDecimal subtotal;
}

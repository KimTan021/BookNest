package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Order details returned after checkout or when viewing history")
public class OrderResponseDTO {

    @Schema(description = "Order identifier", example = "101")
    private Long orderId;
    @Schema(description = "Order total amount", example = "1598.00")
    private BigDecimal totalAmount;
    @Schema(description = "Order status", example = "PLACED")
    private String status;
    @Schema(description = "Order creation timestamp", example = "2026-03-09T10:30:00")
    private LocalDateTime createdAt;
    @Schema(description = "Items included in the order")
    private List<OrderItemResponseDTO> items;
}

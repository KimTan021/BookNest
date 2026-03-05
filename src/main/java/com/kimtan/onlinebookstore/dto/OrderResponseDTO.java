package com.kimtan.onlinebookstore.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long orderId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;
}
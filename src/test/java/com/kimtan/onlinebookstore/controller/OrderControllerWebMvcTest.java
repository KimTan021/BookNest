package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class OrderControllerWebMvcTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void checkoutThrowsUnauthorizedWhenPrincipalMissing() {
        assertThrows(UnauthorizedException.class, () -> orderController.checkout(null));
    }

    @Test
    void checkoutReturnsOrderWhenPrincipalProvided() {
        User principal = User.builder()
                .id(1L)
                .email("user@test.com")
                .password("pw")
                .role("ROLE_USER")
                .build();

        when(orderService.checkout(1L)).thenReturn(OrderResponseDTO.builder()
                .orderId(100L)
                .status("PLACED")
                .totalAmount(new BigDecimal("10.00"))
                .createdAt(LocalDateTime.now())
                .items(List.of())
                .build());

        OrderResponseDTO response = orderController.checkout(principal);

        assertEquals("PLACED", response.getStatus());
        verify(orderService).checkout(1L);
    }

    @Test
    void historyThrowsUnauthorizedWhenPrincipalMissing() {
        assertThrows(UnauthorizedException.class, () -> orderController.getOrderHistory(null));
    }
}

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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void checkoutShouldDelegateToService() {
        User user = User.builder().id(7L).build();
        OrderResponseDTO expected = OrderResponseDTO.builder().orderId(55L).totalAmount(new BigDecimal("500.00")).build();
        when(orderService.checkout(7L)).thenReturn(expected);

        OrderResponseDTO response = orderController.checkout(user);

        assertSame(expected, response);
        verify(orderService).checkout(7L);
    }

    @Test
    void checkoutShouldRejectMissingPrincipal() {
        UnauthorizedException exception =
                assertThrows(UnauthorizedException.class, () -> orderController.checkout(null));

        assertEquals("Authentication required", exception.getMessage());
    }

    @Test
    void getOrderHistoryShouldDelegateToService() {
        User user = User.builder().id(7L).build();
        List<OrderResponseDTO> expected = List.of(OrderResponseDTO.builder().orderId(55L).build());
        when(orderService.getOrderHistory(7L)).thenReturn(expected);

        List<OrderResponseDTO> response = orderController.getOrderHistory(user);

        assertSame(expected, response);
        verify(orderService).getOrderHistory(7L);
    }
}

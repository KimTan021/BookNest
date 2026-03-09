package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.CartResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.CartService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    @Test
    void getCartShouldUseAuthenticatedUserId() {
        User user = User.builder().id(7L).build();
        CartResponseDTO expected = CartResponseDTO.builder().items(List.of()).total(BigDecimal.ZERO).build();
        when(cartService.getCart(7L)).thenReturn(expected);

        CartResponseDTO response = cartController.getCart(user);

        assertSame(expected, response);
        verify(cartService).getCart(7L);
    }

    @Test
    void getCartShouldRejectMissingPrincipal() {
        UnauthorizedException exception =
                assertThrows(UnauthorizedException.class, () -> cartController.getCart(null));

        assertEquals("Authentication required", exception.getMessage());
    }

    @Test
    void addToCartShouldDelegateToService() {
        cartController.addToCart(User.builder().id(7L).build(), 5L, 2);

        verify(cartService).addToCart(7L, 5L, 2);
    }

    @Test
    void updateQuantityShouldDelegateToService() {
        cartController.updateQuantity(User.builder().id(7L).build(), 5L, 4);

        verify(cartService).updateQuantity(7L, 5L, 4);
    }

    @Test
    void removeItemShouldDelegateToService() {
        cartController.removeItem(User.builder().id(7L).build(), 5L);

        verify(cartService).removeItem(7L, 5L);
    }

    @Test
    void clearCartShouldDelegateToService() {
        cartController.clearCart(User.builder().id(7L).build());

        verify(cartService).clearCart(7L);
    }
}

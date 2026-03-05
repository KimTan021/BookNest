package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.CartItem;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CartItemRepository;
import com.kimtan.onlinebookstore.repository.CartRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void addToCartThrowsForInvalidQuantity() {
        assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, 1L, 0));
        assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, 1L, -1));
    }

    @Test
    void addToCartThrowsWhenRequestedQuantityExceedsStock() {
        Cart cart = Cart.builder().id(1L).items(new ArrayList<>()).build();
        Book book = Book.builder().id(2L).stock(5).price(new BigDecimal("10.00")).build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(2L)).thenReturn(Optional.of(book));
        when(cartItemRepository.findByCartIdAndBookId(1L, 2L)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, 2L, 6));
    }

    @Test
    void addToCartCreatesNewItemWhenMissing() {
        Cart cart = Cart.builder().id(1L).items(new ArrayList<>()).build();
        Book book = Book.builder().id(2L).stock(10).price(new BigDecimal("10.00")).build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(2L)).thenReturn(Optional.of(book));
        when(cartItemRepository.findByCartIdAndBookId(1L, 2L)).thenReturn(Optional.empty());

        cartService.addToCart(1L, 2L, 3);

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        CartItem saved = captor.getValue();
        assertEquals(3, saved.getQuantity());
        assertEquals(book, saved.getBook());
        assertEquals(cart, saved.getCart());
    }
}

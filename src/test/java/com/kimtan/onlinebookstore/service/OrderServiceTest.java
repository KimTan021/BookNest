package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.CartItem;
import com.kimtan.onlinebookstore.entity.Order;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void checkoutThrowsWhenCartMissing() {
        when(cartRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.checkout(99L));
    }

    @Test
    void checkoutThrowsWhenCartIsEmpty() {
        Cart cart = Cart.builder().id(1L).items(new ArrayList<>()).build();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        assertThrows(BadRequestException.class, () -> orderService.checkout(1L));
    }

    @Test
    void checkoutThrowsWhenStockIsInsufficient() {
        User user = User.builder().id(1L).email("user@test.com").password("pw").build();
        Book book = Book.builder().id(10L).title("Book").price(new BigDecimal("15.00")).stock(1).build();
        CartItem item = CartItem.builder().book(book).quantity(2).build();
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>()).build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        assertThrows(BadRequestException.class, () -> orderService.checkout(1L));
    }

    @Test
    void checkoutCreatesOrderAndClearsCart() {
        User user = User.builder().id(1L).email("user@test.com").password("pw").build();
        Book book = Book.builder().id(10L).title("Book").price(new BigDecimal("15.00")).stock(10).build();
        CartItem item = CartItem.builder().book(book).quantity(2).build();
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>()).build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(55L);
            return saved;
        });

        OrderResponseDTO response = orderService.checkout(1L);

        assertEquals(55L, response.getOrderId());
        assertEquals("PLACED", response.getStatus());
        assertEquals(new BigDecimal("30.00"), response.getTotalAmount());
        assertEquals(1, response.getItems().size());
        assertEquals(8, book.getStock());
        assertEquals(0, cart.getItems().size());

        verify(bookRepository).save(book);
        verify(orderRepository).save(any(Order.class));
        verify(cartRepository).save(cart);
    }
}

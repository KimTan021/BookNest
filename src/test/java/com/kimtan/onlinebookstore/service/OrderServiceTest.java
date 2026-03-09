package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.CartItem;
import com.kimtan.onlinebookstore.entity.Order;
import com.kimtan.onlinebookstore.entity.OrderItem;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
    void checkoutShouldCreateOrderReduceStockAndClearCart() {
        Cart cart = createCartWithItems();
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(55L);
            order.setCreatedAt(LocalDateTime.of(2026, 3, 9, 10, 0));
            return order;
        });

        OrderResponseDTO response = orderService.checkout(7L);

        assertEquals(55L, response.getOrderId());
        assertEquals("PLACED", response.getStatus());
        assertEquals(new BigDecimal("1750.00"), response.getTotalAmount());
        assertEquals(2, response.getItems().size());
        verify(bookRepository, times(2)).save(any(Book.class));
        verify(orderRepository).save(any(Order.class));
        verify(cartRepository).save(cart);
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void checkoutShouldRejectEmptyCart() {
        Cart cart = Cart.builder()
                .id(20L)
                .user(User.builder().id(7L).build())
                .items(new ArrayList<>())
                .build();
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.checkout(7L));

        assertEquals("Cart is empty", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void checkoutShouldRejectWhenAnyBookHasInsufficientStock() {
        Cart cart = createCartWithItems();
        cart.getItems().getFirst().getBook().setStock(1);
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.checkout(7L));

        assertEquals("Not enough stock for book: Clean Code", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void getOrderHistoryShouldMapRepositoryResults() {
        Order order = Order.builder()
                .id(88L)
                .status("PLACED")
                .totalAmount(new BigDecimal("500.00"))
                .createdAt(LocalDateTime.of(2026, 3, 8, 14, 0))
                .items(new ArrayList<>(List.of(
                        OrderItem.builder()
                                .book(Book.builder().title("Clean Code").build())
                                .quantity(1)
                                .price(new BigDecimal("500.00"))
                                .build()
                )))
                .build();
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(order));

        List<OrderResponseDTO> response = orderService.getOrderHistory(7L);

        assertEquals(1, response.size());
        assertEquals(88L, response.getFirst().getOrderId());
        assertEquals("Clean Code", response.getFirst().getItems().getFirst().getBookTitle());
    }

    private Cart createCartWithItems() {
        User user = User.builder().id(7L).email("user@example.com").password("pw").build();
        Book cleanCode = Book.builder().id(1L).title("Clean Code").price(new BigDecimal("500.00")).stock(10).build();
        Book ddd = Book.builder().id(2L).title("Domain-Driven Design").price(new BigDecimal("750.00")).stock(5).build();
        Cart cart = Cart.builder().id(20L).user(user).items(new ArrayList<>()).build();
        cart.getItems().add(CartItem.builder().cart(cart).book(cleanCode).quantity(2).build());
        cart.getItems().add(CartItem.builder().cart(cart).book(ddd).quantity(1).build());
        return cart;
    }
}

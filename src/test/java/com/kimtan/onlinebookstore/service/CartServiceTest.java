package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.CartResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.CartItem;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
    void getCartShouldCalculateLineSubtotalsAndTotal() {
        Book cleanCode = createBook(1L, "Clean Code", "500.00", 10);
        Book ddd = createBook(2L, "Domain-Driven Design", "750.00", 10);
        Cart cart = createCart(7L);
        cart.setItems(new ArrayList<>(List.of(
                CartItem.builder().cart(cart).book(cleanCode).quantity(2).build(),
                CartItem.builder().cart(cart).book(ddd).quantity(1).build()
        )));
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));

        CartResponseDTO response = cartService.getCart(7L);

        assertEquals(2, response.getItems().size());
        assertEquals(new BigDecimal("1750.00"), response.getTotal());
        assertEquals(new BigDecimal("1000.00"), response.getItems().get(0).getSubtotal());
    }

    @Test
    void addToCartShouldCreateNewCartItem() {
        Cart cart = createCart(7L);
        Book book = createBook(3L, "Dune", "600.00", 5);
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(3L)).thenReturn(Optional.of(book));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 3L)).thenReturn(Optional.empty());

        cartService.addToCart(7L, 3L, 2);

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertEquals(2, captor.getValue().getQuantity());
        assertEquals(book.getId(), captor.getValue().getBook().getId());
        assertEquals(1, cart.getItems().size());
    }

    @Test
    void addToCartShouldIncreaseQuantityWhenItemAlreadyExists() {
        Cart cart = createCart(7L);
        Book book = createBook(3L, "Dune", "600.00", 10);
        CartItem existing = CartItem.builder().cart(cart).book(book).quantity(2).build();
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(3L)).thenReturn(Optional.of(book));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 3L)).thenReturn(Optional.of(existing));

        cartService.addToCart(7L, 3L, 3);

        assertEquals(5, existing.getQuantity());
        verify(cartItemRepository).save(existing);
    }

    @Test
    void addToCartShouldRejectNonPositiveQuantity() {
        BadRequestException exception = assertThrows(BadRequestException.class, () -> cartService.addToCart(7L, 3L, 0));

        assertEquals("Quantity must be greater than 0", exception.getMessage());
        verifyNoInteractions(cartRepository, bookRepository, cartItemRepository);
    }

    @Test
    void addToCartShouldRejectWhenRequestedQuantityExceedsStock() {
        Cart cart = createCart(7L);
        Book book = createBook(3L, "Dune", "600.00", 2);
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(3L)).thenReturn(Optional.of(book));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 3L)).thenReturn(Optional.empty());

        BadRequestException exception = assertThrows(BadRequestException.class, () -> cartService.addToCart(7L, 3L, 3));

        assertEquals("Requested quantity exceeds available stock", exception.getMessage());
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void updateQuantityShouldPersistNewQuantity() {
        Cart cart = createCart(7L);
        Book book = createBook(3L, "Dune", "600.00", 5);
        CartItem item = CartItem.builder().cart(cart).book(book).quantity(1).build();
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 3L)).thenReturn(Optional.of(item));

        cartService.updateQuantity(7L, 3L, 4);

        assertEquals(4, item.getQuantity());
        verify(cartItemRepository).save(item);
    }

    @Test
    void removeItemShouldDeleteExistingCartItem() {
        Cart cart = createCart(7L);
        CartItem item = CartItem.builder().id(8L).cart(cart).book(createBook(3L, "Dune", "600.00", 5)).quantity(1).build();
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 3L)).thenReturn(Optional.of(item));

        cartService.removeItem(7L, 3L);

        verify(cartItemRepository).delete(item);
    }

    @Test
    void clearCartShouldEmptyItemsAndSaveCart() {
        Cart cart = createCart(7L);
        cart.setItems(new ArrayList<>(List.of(CartItem.builder().quantity(1).build())));
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));

        cartService.clearCart(7L);

        assertTrue(cart.getItems().isEmpty());
        verify(cartRepository).save(cart);
    }

    @Test
    void updateQuantityShouldThrowWhenItemIsMissing() {
        Cart cart = createCart(7L);
        when(cartRepository.findByUserId(7L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(cart.getId(), 100L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(ResourceNotFoundException.class, () -> cartService.updateQuantity(7L, 100L, 2));

        assertEquals("Item not found", exception.getMessage());
    }

    private Cart createCart(Long userId) {
        return Cart.builder()
                .id(20L)
                .user(User.builder().id(userId).email("user@example.com").password("pw").build())
                .items(new ArrayList<>())
                .build();
    }

    private Book createBook(Long id, String title, String price, int stock) {
        return Book.builder()
                .id(id)
                .title(title)
                .price(new BigDecimal(price))
                .stock(stock)
                .build();
    }
}

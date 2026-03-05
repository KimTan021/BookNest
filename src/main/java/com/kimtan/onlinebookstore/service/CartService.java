package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.CartItemResponseDTO;
import com.kimtan.onlinebookstore.dto.CartResponseDTO;
import com.kimtan.onlinebookstore.entity.*;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;

    public CartResponseDTO getCart(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItemResponseDTO> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {

            BigDecimal subtotal = item.getBook()
                    .getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            items.add(
                    CartItemResponseDTO.builder()
                            .bookId(item.getBook().getId())
                            .title(item.getBook().getTitle())
                            .quantity(item.getQuantity())
                            .price(item.getBook().getPrice())
                            .subtotal(subtotal)
                            .build()
            );

            total = total.add(subtotal);
        }

        return CartResponseDTO.builder()
                .items(items)
                .total(total)
                .build();
    }

    public void addToCart(Long userId, Long bookId, Integer quantity) {
        validateQuantity(quantity);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), bookId)
                .orElse(null);

        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + quantity;
            validateStock(book, newQuantity);
            cartItem.setQuantity(newQuantity);
        } else {
            validateStock(book, quantity);

            cartItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(quantity)
                    .build();

            cart.getItems().add(cartItem);
        }

        cartItemRepository.save(cartItem);
    }

    public void updateQuantity(Long userId, Long bookId, Integer quantity) {
        validateQuantity(quantity);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        validateStock(item.getBook(), quantity);

        item.setQuantity(quantity);

        cartItemRepository.save(item);
    }

    public void removeItem(Long userId, Long bookId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        cartItemRepository.delete(item);
    }

    public void clearCart(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }
    }

    private void validateStock(Book book, int requestedQuantity) {
        if (requestedQuantity > book.getStock()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }
    }
}

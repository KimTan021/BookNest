package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.OrderItemResponseDTO;
import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.*;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    @Transactional
    public OrderResponseDTO checkout(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = Order.builder()
                .user(cart.getUser())
                .status("PLACED")
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {

            Book book = cartItem.getBook();

            if (book.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Not enough stock for book: " + book.getTitle());
            }

            book.setStock(book.getStock() - cartItem.getQuantity());
            bookRepository.save(book);

            BigDecimal subtotal = book.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .price(book.getPrice())
                    .build();

            order.getItems().add(orderItem);

            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToDTO(savedOrder);
    }

    public List<OrderResponseDTO> getOrderHistory(Long userId) {

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<OrderResponseDTO> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(mapToDTO(order));
        }

        return responses;
    }

    private OrderResponseDTO mapToDTO(Order order) {

        List<OrderItemResponseDTO> items = new ArrayList<>();

        for (OrderItem item : order.getItems()) {

            BigDecimal subtotal = item.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            items.add(
                    OrderItemResponseDTO.builder()
                            .bookTitle(item.getBook().getTitle())
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .subtotal(subtotal)
                            .build()
            );
        }

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}

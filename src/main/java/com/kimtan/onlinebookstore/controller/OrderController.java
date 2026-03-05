package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public OrderResponseDTO checkout(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return orderService.checkout(user.getId());
    }

    @GetMapping("/history")
    public List<OrderResponseDTO> getOrderHistory(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return orderService.getOrderHistory(user.getId());
    }
}

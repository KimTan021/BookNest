package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.CartResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponseDTO getCart(@AuthenticationPrincipal User user) {
        return cartService.getCart(requireUser(user).getId());
    }

    @PostMapping("/add")
    public void addToCart(@AuthenticationPrincipal User user,
                          @RequestParam Long bookId,
                          @RequestParam Integer quantity) {
        cartService.addToCart(requireUser(user).getId(), bookId, quantity);
    }

    @PutMapping("/update")
    public void updateQuantity(@AuthenticationPrincipal User user,
                               @RequestParam Long bookId,
                               @RequestParam Integer quantity) {
        cartService.updateQuantity(requireUser(user).getId(), bookId, quantity);
    }

    @DeleteMapping("/remove")
    public void removeItem(@AuthenticationPrincipal User user,
                           @RequestParam Long bookId) {
        cartService.removeItem(requireUser(user).getId(), bookId);
    }

    @DeleteMapping("/clear")
    public void clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(requireUser(user).getId());
    }

    private User requireUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return user;
    }
}

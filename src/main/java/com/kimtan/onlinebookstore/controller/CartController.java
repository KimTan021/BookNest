package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.CartResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Authenticated shopping cart endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(
            summary = "Get current cart",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Cart returned successfully", content = @Content(schema = @Schema(implementation = CartResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public CartResponseDTO getCart(@AuthenticationPrincipal User user) {
        return cartService.getCart(requireUser(user).getId());
    }

    @PostMapping("/add")
    @Operation(
            summary = "Add an item to the cart",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item added successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void addToCart(@AuthenticationPrincipal User user,
                          @Parameter(description = "Book identifier")
                          @RequestParam Long bookId,
                          @Parameter(description = "Quantity to add")
                          @RequestParam Integer quantity) {
        cartService.addToCart(requireUser(user).getId(), bookId, quantity);
    }

    @PutMapping("/update")
    @Operation(
            summary = "Update item quantity",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quantity updated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void updateQuantity(@AuthenticationPrincipal User user,
                               @Parameter(description = "Book identifier")
                               @RequestParam Long bookId,
                               @Parameter(description = "New quantity")
                               @RequestParam Integer quantity) {
        cartService.updateQuantity(requireUser(user).getId(), bookId, quantity);
    }

    @DeleteMapping("/remove")
    @Operation(
            summary = "Remove an item from the cart",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item removed successfully"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void removeItem(@AuthenticationPrincipal User user,
                           @Parameter(description = "Book identifier")
                           @RequestParam Long bookId) {
        cartService.removeItem(requireUser(user).getId(), bookId);
    }

    @DeleteMapping("/clear")
    @Operation(
            summary = "Clear the cart",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Cart cleared successfully"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
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

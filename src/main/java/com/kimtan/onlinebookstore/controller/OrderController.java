package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.OrderResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Authenticated order endpoints")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(
            summary = "Checkout cart",
            description = "Creates an order from the authenticated user's current cart.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Order created successfully", content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Cart cannot be checked out", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public OrderResponseDTO checkout(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return orderService.checkout(user.getId());
    }

    @GetMapping("/history")
    @Operation(
            summary = "Get order history",
            description = "Returns all orders for the authenticated user.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Order history returned successfully",
                            content = @Content(array = @ArraySchema(schema = @Schema(implementation = OrderResponseDTO.class)))
                    ),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public List<OrderResponseDTO> getOrderHistory(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return orderService.getOrderHistory(user.getId());
    }
}

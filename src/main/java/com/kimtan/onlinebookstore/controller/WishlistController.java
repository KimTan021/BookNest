package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Authenticated wishlist endpoints")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(
            summary = "Get wishlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Wishlist returned successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = BookResponseDTO.class)))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public List<BookResponseDTO> getWishlist(@AuthenticationPrincipal User user) {
        return wishlistService.getWishlist(requireUser(user).getId());
    }

    @PostMapping("/add")
    @Operation(
            summary = "Add to wishlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book added to wishlist"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void addToWishlist(@AuthenticationPrincipal User user,
                              @Parameter(description = "Book identifier")
                              @RequestParam Long bookId) {
        wishlistService.addToWishlist(requireUser(user).getId(), bookId);
    }

    @DeleteMapping("/remove")
    @Operation(
            summary = "Remove from wishlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book removed from wishlist"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Wishlist entry not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void removeFromWishlist(@AuthenticationPrincipal User user,
                                   @Parameter(description = "Book identifier")
                                   @RequestParam Long bookId) {
        wishlistService.removeFromWishlist(requireUser(user).getId(), bookId);
    }

    private User requireUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return user;
    }
}

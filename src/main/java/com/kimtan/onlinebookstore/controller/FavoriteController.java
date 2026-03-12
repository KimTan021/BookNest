package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.FavoriteService;
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
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Authenticated favorites endpoints")
@SecurityRequirement(name = "bearerAuth")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    @Operation(
            summary = "Get favorites",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Favorites returned successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = BookResponseDTO.class)))),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public List<BookResponseDTO> getFavorites(@AuthenticationPrincipal User user) {
        return favoriteService.getFavorites(requireUser(user).getId());
    }

    @PostMapping("/add")
    @Operation(
            summary = "Add to favorites",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book added to favorites"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void addToFavorites(@AuthenticationPrincipal User user,
                               @Parameter(description = "Book identifier")
                               @RequestParam Long bookId) {
        favoriteService.addToFavorites(requireUser(user).getId(), bookId);
    }

    @DeleteMapping("/remove")
    @Operation(
            summary = "Remove from favorites",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book removed from favorites"),
                    @ApiResponse(responseCode = "401", description = "Authentication required", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Favorite entry not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public void removeFromFavorites(@AuthenticationPrincipal User user,
                                    @Parameter(description = "Book identifier")
                                    @RequestParam Long bookId) {
        favoriteService.removeFromFavorites(requireUser(user).getId(), bookId);
    }

    private User requireUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return user;
    }
}

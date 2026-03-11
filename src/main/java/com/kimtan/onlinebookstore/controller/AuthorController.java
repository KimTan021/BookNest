package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.AuthorDetailsResponseDTO;
import com.kimtan.onlinebookstore.dto.AuthorSummaryResponseDTO;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
@Tag(name = "Authors", description = "Public author catalog endpoints")
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    @Operation(
            summary = "List authors",
            description = "Returns all authors ordered by name.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Authors returned successfully",
                            content = @Content(array = @ArraySchema(schema = @Schema(implementation = AuthorSummaryResponseDTO.class)))
                    )
            }
    )
    public java.util.List<AuthorSummaryResponseDTO> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get author details",
            description = "Returns a single author with associated book information.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Author found", content = @Content(schema = @Schema(implementation = AuthorDetailsResponseDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AuthorDetailsResponseDTO getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id);
    }
}

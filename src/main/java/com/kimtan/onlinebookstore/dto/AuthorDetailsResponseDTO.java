package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record AuthorDetailsResponseDTO(
        @Schema(description = "Author identifier", example = "5")
        Long id,
        @Schema(description = "Author full name", example = "Robert C. Martin")
        String name,
        @Schema(description = "Author biography", example = "Software engineer and author known for clean code principles.")
        String bio,
        @Schema(description = "Books written by the author")
        List<AuthorBookResponseDTO> books
) {
}

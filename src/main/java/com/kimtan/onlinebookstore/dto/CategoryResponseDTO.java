package com.kimtan.onlinebookstore.dto;

public record CategoryResponseDTO(
        @io.swagger.v3.oas.annotations.media.Schema(description = "Category identifier", example = "3")
        Long id,
        @io.swagger.v3.oas.annotations.media.Schema(description = "Category name", example = "Software Engineering")
        String name
) {
}

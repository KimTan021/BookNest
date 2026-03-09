package com.kimtan.onlinebookstore.dto;
import io.swagger.v3.oas.annotations.media.Schema;

public record CategoryResponseDTO(
        @Schema(description = "Category identifier", example = "3")
        Long id,
        @Schema(description = "Category name", example = "Software Engineering")
        String name
) {
}

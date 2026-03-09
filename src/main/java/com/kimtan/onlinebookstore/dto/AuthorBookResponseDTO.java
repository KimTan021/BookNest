package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

public record AuthorBookResponseDTO(
        @Schema(description = "Book identifier", example = "12")
        Long id,
        @Schema(description = "Book title", example = "Clean Code")
        String title,
        @Schema(description = "Book price", example = "799.00")
        BigDecimal price,
        @Schema(description = "Book cover image URL", example = "https://example.com/images/clean-code.jpg")
        String imageUrl
) {
}

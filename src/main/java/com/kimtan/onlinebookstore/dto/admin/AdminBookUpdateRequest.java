package com.kimtan.onlinebookstore.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record AdminBookUpdateRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,
        @NotNull(message = "Stock is required")
        @PositiveOrZero(message = "Stock must be 0 or greater")
        Integer stock,
        String imageUrl,
        @NotNull(message = "Author is required")
        Long authorId,
        @NotNull(message = "Category is required")
        Long categoryId
) {
}

package com.kimtan.onlinebookstore.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminCategoryRequest(
        @NotBlank(message = "Category name is required")
        String name
) {
}

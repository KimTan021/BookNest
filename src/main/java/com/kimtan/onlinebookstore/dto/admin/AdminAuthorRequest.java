package com.kimtan.onlinebookstore.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminAuthorRequest(
        @NotBlank(message = "Author name is required")
        String name,
        String bio
) {
}

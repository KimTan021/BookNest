package com.kimtan.onlinebookstore.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(description = "User email address", example = "reader@example.com")
        @Email(message = "Email must be valid")
        @NotBlank(message = "Email is required")
        String email,
        @Schema(description = "User password", example = "secret123")
        @NotBlank(message = "Password is required")
        String password
) {
}

package com.kimtan.onlinebookstore.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(description = "User first name", example = "Kim")
        @NotBlank(message = "First name is required")
        String firstName,
        @Schema(description = "User last name", example = "Tan")
        @NotBlank(message = "Last name is required")
        String lastName,
        @Schema(description = "Unique email address", example = "reader@example.com")
        @Email(message = "Email must be valid")
        @NotBlank(message = "Email is required")
        String email,
        @Schema(description = "Account password", example = "secret123")
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password
) {
}

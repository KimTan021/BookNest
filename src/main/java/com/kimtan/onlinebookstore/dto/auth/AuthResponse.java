package com.kimtan.onlinebookstore.dto.auth;
import io.swagger.v3.oas.annotations.media.Schema;

public record AuthResponse(
        @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyZWFkZXJAZXhhbXBsZS5jb20ifQ.signature")
        String accessToken,
        @Schema(description = "Authorization scheme", example = "Bearer")
        String tokenType,
        @Schema(description = "Token lifetime in seconds", example = "3600")
        long expiresInSeconds
) {
}

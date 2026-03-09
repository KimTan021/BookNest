package com.kimtan.onlinebookstore.dto.auth;

public record AuthResponse(
        @io.swagger.v3.oas.annotations.media.Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyZWFkZXJAZXhhbXBsZS5jb20ifQ.signature")
        String accessToken,
        @io.swagger.v3.oas.annotations.media.Schema(description = "Authorization scheme", example = "Bearer")
        String tokenType,
        @io.swagger.v3.oas.annotations.media.Schema(description = "Token lifetime in seconds", example = "3600")
        long expiresInSeconds
) {
}

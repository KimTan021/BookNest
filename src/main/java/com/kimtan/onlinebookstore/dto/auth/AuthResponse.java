package com.kimtan.onlinebookstore.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds
) {
}

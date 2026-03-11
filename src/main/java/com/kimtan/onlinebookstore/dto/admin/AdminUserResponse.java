package com.kimtan.onlinebookstore.dto.admin;

public record AdminUserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role
) {
}

package com.kimtan.onlinebookstore.dto;

import java.util.List;

public record AuthorDetailsResponseDTO(
        Long id,
        String name,
        String bio,
        List<AuthorBookResponseDTO> books
) {
}

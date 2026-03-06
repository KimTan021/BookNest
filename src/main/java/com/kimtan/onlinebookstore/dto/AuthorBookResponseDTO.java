package com.kimtan.onlinebookstore.dto;

import java.math.BigDecimal;

public record AuthorBookResponseDTO(
        Long id,
        String title,
        BigDecimal price,
        String imageUrl
) {
}

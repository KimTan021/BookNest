package com.kimtan.onlinebookstore.dto.admin;

import java.math.BigDecimal;

public record AdminBookDetailResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        Long authorId,
        String authorName,
        Long categoryId,
        String categoryName
) {
}

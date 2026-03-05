package com.kimtan.onlinebookstore.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponseDTO {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String authorName;
    private String categoryName;
}

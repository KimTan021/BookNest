package com.kimtan.onlinebookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Book details returned by the catalog API")
public class BookResponseDTO {

    @Schema(description = "Book identifier", example = "12")
    private Long id;
    @Schema(description = "Book title", example = "Clean Code")
    private String title;
    @Schema(description = "Book description", example = "A handbook of agile software craftsmanship.")
    private String description;
    @Schema(description = "Book price", example = "799.00")
    private BigDecimal price;
    @Schema(description = "Available stock", example = "24")
    private Integer stock;
    @Schema(description = "Book cover image URL", example = "https://example.com/images/clean-code.jpg")
    private String imageUrl;
    @Schema(description = "Author identifier", example = "5")
    private Long authorId;
    @Schema(description = "Author name", example = "Robert C. Martin")
    private String authorName;
    @Schema(description = "Category name", example = "Software Engineering")
    private String categoryName;
}

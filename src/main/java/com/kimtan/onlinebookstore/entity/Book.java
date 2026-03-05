package com.kimtan.onlinebookstore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;

    private Integer stock;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}

package com.kimtan.onlinebookstore.repository;

import com.kimtan.onlinebookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Book> findByAuthorId(Long authorId, Pageable pageable);

    Page<Book> findByAuthorIdAndCategoryId(Long authorId, Long categoryId, Pageable pageable);

    Page<Book> findByTitleContainingIgnoreCaseAndAuthorId(
           String title,
           Long authorId,
           Pageable pageable
    );

    Page<Book> findByTitleContainingIgnoreCaseAndCategoryId(
           String title,
           Long categoryId,
           Pageable pageable
    );

    Page<Book> findByTitleContainingIgnoreCaseAndAuthorIdAndCategoryId(
            String title,
            Long authorId,
            Long categoryId,
            Pageable pageable
    );

    List<Book> findByAuthorIdOrderByTitleAsc(Long authorId);
}

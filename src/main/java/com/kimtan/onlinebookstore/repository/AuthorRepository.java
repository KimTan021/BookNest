package com.kimtan.onlinebookstore.repository;

import com.kimtan.onlinebookstore.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
    boolean existsByNameIgnoreCase(String name);

    Page<Author> findByNameContainingIgnoreCase(String name, Pageable pageable);
}

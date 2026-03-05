package com.kimtan.onlinebookstore.repository;

import com.kimtan.onlinebookstore.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}

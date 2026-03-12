package com.kimtan.onlinebookstore.repository;

import com.kimtan.onlinebookstore.entity.FavoriteItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, Long> {

    List<FavoriteItem> findByUserIdOrderByIdDesc(Long userId);

    Optional<FavoriteItem> findByUserIdAndBookId(Long userId, Long bookId);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}

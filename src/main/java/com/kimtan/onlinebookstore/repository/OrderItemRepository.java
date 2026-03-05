package com.kimtan.onlinebookstore.repository;

import com.kimtan.onlinebookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
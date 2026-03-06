package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.CategoryResponseDTO;
import com.kimtan.onlinebookstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(category -> new CategoryResponseDTO(category.getId(), category.getName()))
                .toList();
    }
}

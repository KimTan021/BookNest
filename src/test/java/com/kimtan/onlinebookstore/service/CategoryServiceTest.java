package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.CategoryResponseDTO;
import com.kimtan.onlinebookstore.entity.Category;
import com.kimtan.onlinebookstore.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void getAllCategoriesShouldMapRepositoryResults() {
        when(categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))).thenReturn(List.of(
                Category.builder().id(1L).name("Classics").build(),
                Category.builder().id(2L).name("Programming").build()
        ));

        List<CategoryResponseDTO> response = categoryService.getAllCategories();

        assertEquals(2, response.size());
        assertEquals("Classics", response.getFirst().name());
        assertEquals("Programming", response.get(1).name());
        verify(categoryRepository).findAll(Sort.by(Sort.Direction.ASC, "name"));
    }
}

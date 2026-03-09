package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.CategoryResponseDTO;
import com.kimtan.onlinebookstore.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @Test
    void getAllCategoriesShouldDelegateToService() {
        List<CategoryResponseDTO> expected = List.of(new CategoryResponseDTO(1L, "Classics"));
        when(categoryService.getAllCategories()).thenReturn(expected);

        List<CategoryResponseDTO> response = categoryController.getAllCategories();

        assertSame(expected, response);
        verify(categoryService).getAllCategories();
    }
}

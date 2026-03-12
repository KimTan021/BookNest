package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.AuthorDetailsResponseDTO;
import com.kimtan.onlinebookstore.service.AuthorService;
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
class AuthorControllerTest {

    @Mock
    private AuthorService authorService;

    @InjectMocks
    private AuthorController authorController;

    @Test
    void getAuthorByIdShouldDelegateToService() {
        AuthorDetailsResponseDTO expected = new AuthorDetailsResponseDTO(4L, "Frank Herbert", "bio", List.of());
        when(authorService.getAuthorById(4L)).thenReturn(expected);

        AuthorDetailsResponseDTO response = authorController.getAuthorById(4L);

        assertSame(expected, response);
        verify(authorService).getAuthorById(4L);
    }

    @Test
    void getAllAuthorsShouldDelegateToService() {
        List<com.kimtan.onlinebookstore.dto.AuthorSummaryResponseDTO> expected = List.of();
        when(authorService.getAllAuthors()).thenReturn(expected);

        List<com.kimtan.onlinebookstore.dto.AuthorSummaryResponseDTO> response = authorController.getAllAuthors();

        assertSame(expected, response);
        verify(authorService).getAllAuthors();
    }
}

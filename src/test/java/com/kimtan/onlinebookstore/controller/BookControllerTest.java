package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.service.BookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookControllerTest {

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookController bookController;

    @Test
    void getAllBooksShouldDelegateToService() {
        Page<BookResponseDTO> expected = new PageImpl<>(List.of(createBookResponse()));
        when(bookService.getAllBooks(0, 10)).thenReturn(expected);

        Page<BookResponseDTO> response = bookController.getAllBooks(0, 10);

        assertSame(expected, response);
        verify(bookService).getAllBooks(0, 10);
    }

    @Test
    void getBookByIdShouldDelegateToService() {
        BookResponseDTO expected = createBookResponse();
        when(bookService.getBookById(5L)).thenReturn(expected);

        BookResponseDTO response = bookController.getBookById(5L);

        assertSame(expected, response);
        verify(bookService).getBookById(5L);
    }

    @Test
    void searchBooksShouldDelegateToService() {
        Page<BookResponseDTO> expected = new PageImpl<>(List.of(createBookResponse()));
        when(bookService.searchBooks("dune", 2L, 1, 8)).thenReturn(expected);

        Page<BookResponseDTO> response = bookController.searchBooks("dune", 2L, 1, 8);

        assertSame(expected, response);
        verify(bookService).searchBooks("dune", 2L, 1, 8);
    }

    private BookResponseDTO createBookResponse() {
        return BookResponseDTO.builder()
                .id(5L)
                .title("Dune")
                .price(new BigDecimal("799.00"))
                .authorName("Frank Herbert")
                .categoryName("Science Fiction")
                .build();
    }
}

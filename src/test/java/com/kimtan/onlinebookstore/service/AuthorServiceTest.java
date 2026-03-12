package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.AuthorDetailsResponseDTO;
import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.AuthorRepository;
import com.kimtan.onlinebookstore.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private AuthorService authorService;

    @Test
    void getAuthorByIdShouldReturnAuthorAndBooks() {
        Author author = Author.builder().id(4L).name("Frank Herbert").bio("Science fiction author").build();
        when(authorRepository.findById(4L)).thenReturn(Optional.of(author));
        when(bookRepository.findByAuthorIdOrderByTitleAsc(4L)).thenReturn(List.of(
                Book.builder().id(10L).title("Dune").price(new BigDecimal("799.00")).imageUrl("dune.jpg").build()
        ));

        AuthorDetailsResponseDTO response = authorService.getAuthorById(4L);

        assertEquals(4L, response.id());
        assertEquals("Frank Herbert", response.name());
        assertEquals("Science fiction author", response.bio());
        assertEquals(1, response.books().size());
        assertEquals("Dune", response.books().getFirst().title());
    }

    @Test
    void getAuthorByIdShouldThrowWhenAuthorDoesNotExist() {
        when(authorRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(ResourceNotFoundException.class, () -> authorService.getAuthorById(999L));

        assertEquals("Author not found", exception.getMessage());
    }

    @Test
    void getAllAuthorsShouldReturnAlphabeticallySortedList() {
        when(authorRepository.findAll()).thenReturn(List.of(
                Author.builder().name("Zebra").build(),
                Author.builder().name("Apple").build(),
                Author.builder().name("banana").build()
        ));

        var response = authorService.getAllAuthors();

        assertEquals(3, response.size());
        assertEquals("Apple", response.get(0).name());
        assertEquals("banana", response.get(1).name());
        assertEquals("Zebra", response.get(2).name());
    }
}

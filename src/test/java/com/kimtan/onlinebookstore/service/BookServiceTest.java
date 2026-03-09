package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Category;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    @Test
    void getAllBooksShouldReturnMappedPage() {
        Book book = createBook(1L, "Clean Code", "Robert C. Martin", "Programming");
        Page<Book> page = new PageImpl<>(List.of(book));
        when(bookRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<BookResponseDTO> response = bookService.getAllBooks(0, 10);

        assertEquals(1, response.getTotalElements());
        assertEquals("Clean Code", response.getContent().getFirst().getTitle());
        assertEquals("Robert C. Martin", response.getContent().getFirst().getAuthorName());
        assertEquals("Programming", response.getContent().getFirst().getCategoryName());
        verify(bookRepository).findAll(any(Pageable.class));
    }

    @Test
    void searchBooksShouldUseCombinedFilterWhenTitleAndCategoryExist() {
        Book book = createBook(1L, "Dune", "Frank Herbert", "Science Fiction");
        when(bookRepository.findByTitleContainingIgnoreCaseAndCategoryId(eq("dune"), eq(2L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(book)));

        Page<BookResponseDTO> response = bookService.searchBooks("dune", 2L, 0, 5);

        assertEquals(1, response.getTotalElements());
        assertEquals("Dune", response.getContent().getFirst().getTitle());
        verify(bookRepository).findByTitleContainingIgnoreCaseAndCategoryId(eq("dune"), eq(2L), any(Pageable.class));
        verify(bookRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void searchBooksShouldFallbackToAllBooksWhenNoFiltersProvided() {
        when(bookRepository.findAll(any(Pageable.class))).thenReturn(
                new PageImpl<>(List.of(createBook(3L, "1984", "George Orwell", "Classics")))
        );

        Page<BookResponseDTO> response = bookService.searchBooks(null, null, 0, 10);

        assertEquals(1, response.getTotalElements());
        verify(bookRepository).findAll(any(Pageable.class));
    }

    @Test
    void getBookByIdShouldUseFallbackLabelsForMissingRelations() {
        Book book = Book.builder()
                .id(9L)
                .title("Unknown Book")
                .description("desc")
                .price(new BigDecimal("199.00"))
                .stock(4)
                .imageUrl("image.jpg")
                .build();
        when(bookRepository.findById(9L)).thenReturn(Optional.of(book));

        BookResponseDTO response = bookService.getBookById(9L);

        assertEquals("Unknown Author", response.getAuthorName());
        assertEquals("Uncategorized", response.getCategoryName());
        assertNull(response.getAuthorId());
    }

    @Test
    void getBookByIdShouldThrowWhenMissing() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(ResourceNotFoundException.class, () -> bookService.getBookById(99L));

        assertEquals("Book not found", exception.getMessage());
    }

    private Book createBook(Long id, String title, String authorName, String categoryName) {
        return Book.builder()
                .id(id)
                .title(title)
                .description("Description")
                .price(new BigDecimal("499.00"))
                .stock(10)
                .imageUrl("image.jpg")
                .author(Author.builder().id(11L).name(authorName).build())
                .category(Category.builder().id(12L).name(categoryName).build())
                .build();
    }
}

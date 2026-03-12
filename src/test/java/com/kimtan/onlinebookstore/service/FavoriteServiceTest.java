package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.FavoriteItem;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.FavoriteItemRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock private FavoriteItemRepository favoriteItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookRepository bookRepository;
    @Mock private BookService bookService;

    @InjectMocks
    private FavoriteService favoriteService;

    @Test
    void getFavoritesShouldReturnMappedBooks() {
        Long userId = 1L;
        Book book = Book.builder().id(10L).title("Test Book").build();
        FavoriteItem item = FavoriteItem.builder().book(book).build();
        BookResponseDTO dto = BookResponseDTO.builder().id(10L).title("Test Book").build();

        when(favoriteItemRepository.findByUserIdOrderByIdDesc(userId)).thenReturn(List.of(item));
        when(bookService.mapToDTO(book)).thenReturn(dto);

        List<BookResponseDTO> result = favoriteService.getFavorites(userId);

        assertEquals(1, result.size());
        assertEquals("Test Book", result.get(0).getTitle());
    }

    @Test
    void addToFavoritesShouldCreateNewItem() {
        Long userId = 1L;
        Long bookId = 10L;
        User user = User.builder().id(userId).build();
        Book book = Book.builder().id(bookId).build();

        when(favoriteItemRepository.existsByUserIdAndBookId(userId, bookId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

        favoriteService.addToFavorites(userId, bookId);

        verify(favoriteItemRepository).save(any(FavoriteItem.class));
    }

    @Test
    void addToFavoritesShouldSkipIfAlreadyExists() {
        Long userId = 1L;
        Long bookId = 10L;
        when(favoriteItemRepository.existsByUserIdAndBookId(userId, bookId)).thenReturn(true);

        favoriteService.addToFavorites(userId, bookId);

        verify(favoriteItemRepository, never()).save(any());
    }

    @Test
    void removeFromFavoritesShouldDeleteIfFound() {
        Long userId = 1L;
        Long bookId = 10L;
        FavoriteItem item = new FavoriteItem();
        when(favoriteItemRepository.findByUserIdAndBookId(userId, bookId)).thenReturn(Optional.of(item));

        favoriteService.removeFromFavorites(userId, bookId);

        verify(favoriteItemRepository).delete(item);
    }

    @Test
    void removeFromFavoritesShouldThrowIfNotFound() {
        Long userId = 1L;
        Long bookId = 10L;
        when(favoriteItemRepository.findByUserIdAndBookId(userId, bookId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> favoriteService.removeFromFavorites(userId, bookId));
    }
}

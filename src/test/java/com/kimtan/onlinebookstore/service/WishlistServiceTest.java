package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.entity.WishlistItem;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import com.kimtan.onlinebookstore.repository.WishlistItemRepository;
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
class WishlistServiceTest {

    @Mock private WishlistItemRepository wishlistItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookRepository bookRepository;
    @Mock private BookService bookService;

    @InjectMocks
    private WishlistService wishlistService;

    @Test
    void getWishlistShouldReturnMappedBooks() {
        Long userId = 1L;
        Book book = Book.builder().id(10L).title("Test Book").build();
        WishlistItem item = WishlistItem.builder().book(book).build();
        BookResponseDTO dto = BookResponseDTO.builder().id(10L).title("Test Book").build();

        when(wishlistItemRepository.findByUserIdOrderByIdDesc(userId)).thenReturn(List.of(item));
        when(bookService.mapToDTO(book)).thenReturn(dto);

        List<BookResponseDTO> result = wishlistService.getWishlist(userId);

        assertEquals(1, result.size());
        assertEquals("Test Book", result.get(0).getTitle());
    }

    @Test
    void addToWishlistShouldCreateNewItem() {
        Long userId = 1L;
        Long bookId = 10L;
        User user = User.builder().id(userId).build();
        Book book = Book.builder().id(bookId).build();

        when(wishlistItemRepository.existsByUserIdAndBookId(userId, bookId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

        wishlistService.addToWishlist(userId, bookId);

        verify(wishlistItemRepository).save(any(WishlistItem.class));
    }

    @Test
    void addToWishlistShouldSkipIfAlreadyExists() {
        Long userId = 1L;
        Long bookId = 10L;
        when(wishlistItemRepository.existsByUserIdAndBookId(userId, bookId)).thenReturn(true);

        wishlistService.addToWishlist(userId, bookId);

        verify(wishlistItemRepository, never()).save(any());
    }

    @Test
    void removeFromWishlistShouldDeleteIfFound() {
        Long userId = 1L;
        Long bookId = 10L;
        WishlistItem item = new WishlistItem();
        when(wishlistItemRepository.findByUserIdAndBookId(userId, bookId)).thenReturn(Optional.of(item));

        wishlistService.removeFromWishlist(userId, bookId);

        verify(wishlistItemRepository).delete(item);
    }

    @Test
    void removeFromWishlistShouldThrowIfNotFound() {
        Long userId = 1L;
        Long bookId = 10L;
        when(wishlistItemRepository.findByUserIdAndBookId(userId, bookId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> wishlistService.removeFromWishlist(userId, bookId));
    }
}

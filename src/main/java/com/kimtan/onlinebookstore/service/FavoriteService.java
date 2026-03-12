package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.FavoriteItem;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.FavoriteItemRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteItemRepository favoriteItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;

    public List<BookResponseDTO> getFavorites(Long userId) {
        return favoriteItemRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(FavoriteItem::getBook)
                .map(bookService::mapToDTO)
                .toList();
    }

    public void addToFavorites(Long userId, Long bookId) {
        if (favoriteItemRepository.existsByUserIdAndBookId(userId, bookId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        FavoriteItem item = FavoriteItem.builder()
                .user(user)
                .book(book)
                .build();

        favoriteItemRepository.save(item);
    }

    public void removeFromFavorites(Long userId, Long bookId) {
        FavoriteItem item = favoriteItemRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite entry not found"));

        favoriteItemRepository.delete(item);
    }
}

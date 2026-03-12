package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.entity.WishlistItem;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import com.kimtan.onlinebookstore.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;

    public List<BookResponseDTO> getWishlist(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(WishlistItem::getBook)
                .map(bookService::mapToDTO)
                .toList();
    }

    public void addToWishlist(Long userId, Long bookId) {
        if (wishlistItemRepository.existsByUserIdAndBookId(userId, bookId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .book(book)
                .build();

        wishlistItemRepository.save(item);
    }

    public void removeFromWishlist(Long userId, Long bookId) {
        WishlistItem item = wishlistItemRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist entry not found"));

        wishlistItemRepository.delete(item);
    }
}

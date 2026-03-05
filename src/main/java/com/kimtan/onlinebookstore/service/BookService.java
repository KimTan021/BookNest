package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Page<BookResponseDTO> getAllBooks(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());

        return bookRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    public Page<BookResponseDTO> searchBooks(String title,
                                             Long categoryId,
                                             int page,
                                             int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());

        if (title != null && categoryId != null) {
            return bookRepository
                    .findByTitleContainingIgnoreCaseAndCategoryId(
                            title, categoryId, pageable)
                    .map(this::mapToDTO);
        }

        if (title != null) {
            return bookRepository
                    .findByTitleContainingIgnoreCase(title, pageable)
                    .map(this::mapToDTO);
        }

        if (categoryId != null) {
            return bookRepository
                    .findByCategoryId(categoryId, pageable)
                    .map(this::mapToDTO);
        }

        return bookRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    public BookResponseDTO getBookById(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        return mapToDTO(book);
    }

    private BookResponseDTO mapToDTO(Book book) {
        String authorName = book.getAuthor() != null ? book.getAuthor().getName() : "Unknown Author";
        String categoryName = book.getCategory() != null ? book.getCategory().getName() : "Uncategorized";

        return BookResponseDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .description(book.getDescription())
                .price(book.getPrice())
                .stock(book.getStock())
                .imageUrl(book.getImageUrl())
                .authorName(authorName)
                .categoryName(categoryName)
                .build();
    }
}

package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.AuthorBookResponseDTO;
import com.kimtan.onlinebookstore.dto.AuthorDetailsResponseDTO;
import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.AuthorRepository;
import com.kimtan.onlinebookstore.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    public AuthorDetailsResponseDTO getAuthorById(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

        List<AuthorBookResponseDTO> books = bookRepository.findByAuthorIdOrderByTitleAsc(authorId)
                .stream()
                .map(book -> new AuthorBookResponseDTO(
                        book.getId(),
                        book.getTitle(),
                        book.getPrice(),
                        book.getImageUrl()
                ))
                .toList();

        return new AuthorDetailsResponseDTO(
                author.getId(),
                author.getName(),
                author.getBio(),
                books
        );
    }
}

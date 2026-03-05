package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public Page<BookResponseDTO> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return bookService.getAllBooks(page, size);
    }

    @GetMapping("/{id}")
    public BookResponseDTO getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @GetMapping("/search")
    public Page<BookResponseDTO> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return bookService.searchBooks(title, categoryId, page, size);
    }
}
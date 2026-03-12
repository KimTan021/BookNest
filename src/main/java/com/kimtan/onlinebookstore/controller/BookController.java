package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Public book catalog endpoints")
public class BookController {

    private final BookService bookService;

    @GetMapping
    @Operation(
            summary = "List books",
            description = "Returns paginated books from the catalog.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Books returned successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination request", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public Page<BookResponseDTO> getAllBooks(
            @Parameter(description = "Zero-based page index") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size) {

        return bookService.getAllBooks(page, size);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get book by ID",
            description = "Returns a single book from the catalog.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book found", content = @Content(schema = @Schema(implementation = BookResponseDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public BookResponseDTO getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search books",
            description = "Filters books by title, author, and/or category.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Search results returned"),
                    @ApiResponse(responseCode = "400", description = "Invalid search request", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public Page<BookResponseDTO> searchBooks(
            @Parameter(description = "Partial or full book title")
            @RequestParam(required = false) String title,
            @Parameter(description = "Author identifier")
            @RequestParam(required = false) Long authorId,
            @Parameter(description = "Category identifier")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Zero-based page index")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size) {

        return bookService.searchBooks(title, categoryId, authorId, page, size);
    }
}

package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.dto.CategoryResponseDTO;
import com.kimtan.onlinebookstore.dto.admin.AdminAuthorRequest;
import com.kimtan.onlinebookstore.dto.admin.AdminAuthorResponse;
import com.kimtan.onlinebookstore.dto.admin.AdminBookCreateRequest;
import com.kimtan.onlinebookstore.dto.admin.AdminBookDetailResponse;
import com.kimtan.onlinebookstore.dto.admin.AdminBookUpdateRequest;
import com.kimtan.onlinebookstore.dto.admin.AdminCategoryRequest;
import com.kimtan.onlinebookstore.dto.admin.AdminMetricsResponse;
import com.kimtan.onlinebookstore.dto.admin.AdminUserCreateRequest;
import com.kimtan.onlinebookstore.dto.admin.AdminUserResponse;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative operations")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/users")
    @Operation(
            summary = "Create a user",
            description = "Creates a new user account with an optional role.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User created successfully", content = @Content(schema = @Schema(implementation = AdminUserResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AdminUserResponse createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return adminService.createUser(request);
    }

    @GetMapping("/users")
    @Operation(
            summary = "List users",
            description = "Returns all users or matches by query.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Users returned successfully", content = @Content(schema = @Schema(implementation = AdminUserResponse.class)))
            }
    )
    public List<AdminUserResponse> listUsers(@RequestParam(required = false) String query) {
        return adminService.listUsers(query);
    }

    @PostMapping("/books")
    @Operation(
            summary = "Add a new book",
            description = "Creates a new book in the catalog.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book created successfully", content = @Content(schema = @Schema(implementation = BookResponseDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Author or category not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public BookResponseDTO createBook(@Valid @RequestBody AdminBookCreateRequest request) {
        return adminService.createBook(request);
    }

    @GetMapping("/books/{id}")
    @Operation(
            summary = "Get book detail for editing",
            description = "Returns book data including author and category identifiers.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book returned successfully", content = @Content(schema = @Schema(implementation = AdminBookDetailResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AdminBookDetailResponse getBookDetail(@PathVariable Long id) {
        return adminService.getBookDetail(id);
    }

    @PutMapping("/books/{id}")
    @Operation(
            summary = "Update a book",
            description = "Updates book information for the catalog.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Book updated successfully", content = @Content(schema = @Schema(implementation = BookResponseDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public BookResponseDTO updateBook(@PathVariable Long id, @Valid @RequestBody AdminBookUpdateRequest request) {
        return adminService.updateBook(id, request);
    }

    @DeleteMapping("/books/{id}")
    @Operation(
            summary = "Delete a book",
            description = "Removes a book from the catalog.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Book deleted successfully"),
                    @ApiResponse(responseCode = "400", description = "Book cannot be deleted", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteBook(@PathVariable Long id) {
        adminService.deleteBook(id);
    }

    @GetMapping("/authors")
    @Operation(
            summary = "List authors",
            description = "Returns all authors with bio fields.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Authors returned successfully", content = @Content(schema = @Schema(implementation = AdminAuthorResponse.class)))
            }
    )
    public List<AdminAuthorResponse> listAuthors() {
        return adminService.listAuthors();
    }

    @PostMapping("/authors")
    @Operation(
            summary = "Create author",
            description = "Creates a new author entry.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Author created successfully", content = @Content(schema = @Schema(implementation = AdminAuthorResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Author already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AdminAuthorResponse createAuthor(@Valid @RequestBody AdminAuthorRequest request) {
        return adminService.createAuthor(request);
    }

    @PutMapping("/authors/{id}")
    @Operation(
            summary = "Update author",
            description = "Updates an existing author entry.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Author updated successfully", content = @Content(schema = @Schema(implementation = AdminAuthorResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Author already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AdminAuthorResponse updateAuthor(@PathVariable Long id, @Valid @RequestBody AdminAuthorRequest request) {
        return adminService.updateAuthor(id, request);
    }

    @DeleteMapping("/authors/{id}")
    @Operation(
            summary = "Delete author",
            description = "Deletes an author entry.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Author deleted successfully"),
                    @ApiResponse(responseCode = "400", description = "Author cannot be deleted", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteAuthor(@PathVariable Long id) {
        adminService.deleteAuthor(id);
    }

    @GetMapping("/categories")
    @Operation(
            summary = "List categories",
            description = "Returns all categories.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Categories returned successfully", content = @Content(schema = @Schema(implementation = CategoryResponseDTO.class)))
            }
    )
    public List<CategoryResponseDTO> listCategories() {
        return adminService.listCategories();
    }

    @PostMapping("/categories")
    @Operation(
            summary = "Create category",
            description = "Creates a new category.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Category created successfully", content = @Content(schema = @Schema(implementation = CategoryResponseDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Category already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public CategoryResponseDTO createCategory(@Valid @RequestBody AdminCategoryRequest request) {
        return adminService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    @Operation(
            summary = "Update category",
            description = "Updates an existing category.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Category updated successfully", content = @Content(schema = @Schema(implementation = CategoryResponseDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Category already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public CategoryResponseDTO updateCategory(@PathVariable Long id, @Valid @RequestBody AdminCategoryRequest request) {
        return adminService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @Operation(
            summary = "Delete category",
            description = "Deletes a category.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
                    @ApiResponse(responseCode = "400", description = "Category cannot be deleted", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
    }

    @GetMapping("/metrics")
    @Operation(
            summary = "Admin metrics",
            description = "Returns high-level counts for the dashboard.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Metrics returned successfully", content = @Content(schema = @Schema(implementation = AdminMetricsResponse.class)))
            }
    )
    public AdminMetricsResponse getMetrics() {
        return adminService.getMetrics();
    }
}

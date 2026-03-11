package com.kimtan.onlinebookstore.service;

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
import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.Category;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ConflictException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.AuthorRepository;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.CategoryRepository;
import com.kimtan.onlinebookstore.repository.OrderRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookService bookService;

    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }

        String role = normalizeRole(request.role());
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        Cart cart = Cart.builder()
                .user(savedUser)
                .build();
        cartRepository.save(cart);

        return new AdminUserResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public List<AdminUserResponse> listUsers(String query) {
        List<User> users;
        if (query == null || query.isBlank()) {
            users = userRepository.findAll();
        } else {
            users = userRepository.findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                    query, query, query
            );
        }
        return users.stream()
                .sorted(Comparator.comparing(User::getLastName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(User::getFirstName, String.CASE_INSENSITIVE_ORDER))
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }

    public BookResponseDTO createBook(AdminBookCreateRequest request) {
        Author author = authorRepository.findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Book book = Book.builder()
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .stock(request.stock())
                .imageUrl(request.imageUrl())
                .author(author)
                .category(category)
                .build();

        Book savedBook = bookRepository.save(book);
        return bookService.mapToDTO(savedBook);
    }

    public AdminBookDetailResponse getBookDetail(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        return mapToAdminBookDetail(book);
    }

    public BookResponseDTO updateBook(Long bookId, AdminBookUpdateRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        Author author = authorRepository.findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        book.setTitle(request.title());
        book.setDescription(request.description());
        book.setPrice(request.price());
        book.setStock(request.stock());
        book.setImageUrl(request.imageUrl());
        book.setAuthor(author);
        book.setCategory(category);

        Book savedBook = bookRepository.save(book);
        return bookService.mapToDTO(savedBook);
    }

    public void deleteBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        try {
            bookRepository.delete(book);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Book cannot be deleted because it is in use");
        }
    }

    public List<AdminAuthorResponse> listAuthors() {
        return authorRepository.findAll().stream()
                .sorted(Comparator.comparing(Author::getName, String.CASE_INSENSITIVE_ORDER))
                .map(author -> new AdminAuthorResponse(author.getId(), author.getName(), author.getBio()))
                .toList();
    }

    public AdminAuthorResponse createAuthor(AdminAuthorRequest request) {
        if (authorRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Author already exists");
        }
        Author author = Author.builder()
                .name(request.name())
                .bio(request.bio())
                .build();
        Author saved = authorRepository.save(author);
        return new AdminAuthorResponse(saved.getId(), saved.getName(), saved.getBio());
    }

    public AdminAuthorResponse updateAuthor(Long authorId, AdminAuthorRequest request) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        if (!author.getName().equalsIgnoreCase(request.name())
                && authorRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Author already exists");
        }
        author.setName(request.name());
        author.setBio(request.bio());
        Author saved = authorRepository.save(author);
        return new AdminAuthorResponse(saved.getId(), saved.getName(), saved.getBio());
    }

    public void deleteAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        try {
            authorRepository.delete(author);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Author cannot be deleted because it is in use");
        }
    }

    public List<CategoryResponseDTO> listCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(category -> new CategoryResponseDTO(category.getId(), category.getName()))
                .toList();
    }

    public CategoryResponseDTO createCategory(AdminCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Category already exists");
        }
        Category category = Category.builder()
                .name(request.name())
                .build();
        Category saved = categoryRepository.save(category);
        return new CategoryResponseDTO(saved.getId(), saved.getName());
    }

    public CategoryResponseDTO updateCategory(Long categoryId, AdminCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getName().equalsIgnoreCase(request.name())
                && categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Category already exists");
        }
        category.setName(request.name());
        Category saved = categoryRepository.save(category);
        return new CategoryResponseDTO(saved.getId(), saved.getName());
    }

    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        try {
            categoryRepository.delete(category);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Category cannot be deleted because it is in use");
        }
    }

    public AdminMetricsResponse getMetrics() {
        return new AdminMetricsResponse(
                userRepository.count(),
                bookRepository.count(),
                orderRepository.count(),
                categoryRepository.count(),
                authorRepository.count()
        );
    }

    private AdminBookDetailResponse mapToAdminBookDetail(Book book) {
        Long authorId = book.getAuthor() != null ? book.getAuthor().getId() : null;
        Long categoryId = book.getCategory() != null ? book.getCategory().getId() : null;
        String authorName = book.getAuthor() != null ? book.getAuthor().getName() : "Unknown Author";
        String categoryName = book.getCategory() != null ? book.getCategory().getName() : "Uncategorized";

        return new AdminBookDetailResponse(
                book.getId(),
                book.getTitle(),
                book.getDescription(),
                book.getPrice(),
                book.getStock(),
                book.getImageUrl(),
                authorId,
                authorName,
                categoryId,
                categoryName
        );
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = role.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        if (!normalized.equals("ROLE_USER") && !normalized.equals("ROLE_ADMIN")) {
            throw new BadRequestException("Role must be ROLE_USER or ROLE_ADMIN");
        }
        return normalized;
    }
}

package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.dto.CategoryResponseDTO;
import com.kimtan.onlinebookstore.dto.admin.*;
import com.kimtan.onlinebookstore.entity.*;
import com.kimtan.onlinebookstore.exception.BadRequestException;
import com.kimtan.onlinebookstore.exception.ConflictException;
import com.kimtan.onlinebookstore.exception.ResourceNotFoundException;
import com.kimtan.onlinebookstore.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private BookRepository bookRepository;
    @Mock private AuthorRepository authorRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private CartRepository cartRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private BookService bookService;

    @InjectMocks
    private AdminService adminService;

    // ─── User Management ──────────────────────────────────────────────────────

    @Test
    void createUserShouldSaveUserAndCartAndReturnResponse() {
        AdminUserCreateRequest request = new AdminUserCreateRequest("Kim", "Tan", "kim@example.com", "secret123", "ADMIN");
        when(userRepository.existsByEmail("kim@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-secret");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });

        AdminUserResponse response = adminService.createUser(request);

        assertEquals("ROLE_ADMIN", response.role());
        verify(userRepository).save(any(User.class));
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void createUserShouldRejectDuplicateEmail() {
        AdminUserCreateRequest request = new AdminUserCreateRequest("Kim", "Tan", "dup@example.com", "pw", null);
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> adminService.createUser(request));
    }

    @Test
    void createUserShouldNormalizeRoleWhenMissing() {
        AdminUserCreateRequest request = new AdminUserCreateRequest("Kim", "Tan", "kim@example.com", "pw", "");
        when(userRepository.existsByEmail("kim@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        AdminUserResponse response = adminService.createUser(request);

        assertEquals("ROLE_USER", response.role());
    }

    @Test
    void createUserShouldRejectInvalidRole() {
        AdminUserCreateRequest request = new AdminUserCreateRequest("Kim", "Tan", "kim@example.com", "pw", "SUPERUSER");
        when(userRepository.existsByEmail("kim@example.com")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> adminService.createUser(request));
        assertEquals("Role must be ROLE_USER or ROLE_ADMIN", ex.getMessage());
    }

    @Test
    void listUsersShouldReturnAllWhenNoQuery() {
        Page<User> page = new PageImpl<>(List.of(User.builder().firstName("Kim").lastName("Tan").role("ROLE_USER").build()));
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<AdminUserResponse> response = adminService.listUsers(null, 0, 10);

        assertEquals(1, response.getTotalElements());
        verify(userRepository).findAll(any(Pageable.class));
    }

    // ─── Book Management ──────────────────────────────────────────────────────

    @Test
    void createBookShouldSaveBookAndReturnMappedDTO() {
        AdminBookCreateRequest request = new AdminBookCreateRequest("Dune", "desc", BigDecimal.TEN, 5, "url", 1L, 2L);
        Author author = Author.builder().id(1L).build();
        Category category = Category.builder().id(2L).build();
        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));
        when(bookService.mapToDTO(any(Book.class))).thenReturn(BookResponseDTO.builder().title("Dune").build());

        BookResponseDTO response = adminService.createBook(request);

        assertEquals("Dune", response.getTitle());
    }

    @Test
    void createBookShouldThrowWhenAuthorNotFound() {
        AdminBookCreateRequest request = new AdminBookCreateRequest("Dune", "desc", BigDecimal.TEN, 5, "url", 99L, 2L);
        when(authorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminService.createBook(request));
    }

    @Test
    void getBookDetailShouldReturnMappedResponse() {
        Book book = Book.builder()
                .id(10L)
                .author(Author.builder().id(1L).name("Frank Herbert").build())
                .category(Category.builder().id(2L).name("Sci-Fi").build())
                .build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        AdminBookDetailResponse response = adminService.getBookDetail(10L);

        assertEquals("Frank Herbert", response.authorName());
        assertEquals(1L, response.authorId());
    }

    @Test
    void updateBookShouldPersistChanges() {
        Book book = Book.builder().id(10L).title("Old").build();
        AdminBookUpdateRequest request = new AdminBookUpdateRequest("New", "desc", BigDecimal.ONE, 1, "url", 1L, 2L);
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(authorRepository.findById(1L)).thenReturn(Optional.of(Author.builder().id(1L).build()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(Category.builder().id(2L).build()));
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        adminService.updateBook(10L, request);

        assertEquals("New", book.getTitle());
        verify(bookRepository).save(book);
    }

    @Test
    void deleteBookShouldThrowBadRequestWhenInUse() {
        Book book = Book.builder().id(10L).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        doThrow(DataIntegrityViolationException.class).when(bookRepository).delete(book);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> adminService.deleteBook(10L));
        assertEquals("Book cannot be deleted because it is in use", ex.getMessage());
    }

    // ─── Author Management ────────────────────────────────────────────────────

    @Test
    void listAuthorsShouldReturnSortedList() {
        when(authorRepository.findAll(any(Sort.class))).thenReturn(List.of(
                Author.builder().name("A").build(),
                Author.builder().name("B").build()
        ));

        List<AdminAuthorResponse> response = adminService.listAuthors();

        assertEquals(2, response.size());
    }

    @Test
    void createAuthorShouldThrowWhenDuplicate() {
        AdminAuthorRequest request = new AdminAuthorRequest("Frank Herbert", "bio");
        when(authorRepository.existsByNameIgnoreCase("Frank Herbert")).thenReturn(true);

        assertThrows(ConflictException.class, () -> adminService.createAuthor(request));
    }

    @Test
    void updateAuthorShouldAllowSameName() {
        Author author = Author.builder().id(1L).name("Frank").build();
        AdminAuthorRequest request = new AdminAuthorRequest("Frank", "New Bio");
        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));
        when(authorRepository.save(any(Author.class))).thenReturn(author);

        adminService.updateAuthor(1L, request);

        verify(authorRepository, never()).existsByNameIgnoreCase(anyString());
        verify(authorRepository).save(author);
    }

    @Test
    void updateAuthorShouldThrowWhenDuplicateNameChanged() {
        Author author = Author.builder().id(1L).name("Old").build();
        AdminAuthorRequest request = new AdminAuthorRequest("New", "bio");
        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));
        when(authorRepository.existsByNameIgnoreCase("New")).thenReturn(true);

        assertThrows(ConflictException.class, () -> adminService.updateAuthor(1L, request));
    }

    // ─── Category Management ──────────────────────────────────────────────────

    @Test
    void createCategoryShouldSaveAndReturnResponse() {
        AdminCategoryRequest request = new AdminCategoryRequest("Sci-Fi");
        when(categoryRepository.existsByNameIgnoreCase("Sci-Fi")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> {
            Category c = i.getArgument(0);
            c.setId(1L);
            return c;
        });

        CategoryResponseDTO response = adminService.createCategory(request);

        assertEquals("Sci-Fi", response.name());
        verify(categoryRepository).save(any(Category.class));
    }

    // ─── Metrics ──────────────────────────────────────────────────────────────

    @Test
    void getMetricsShouldReturnCountsFromRepositories() {
        when(userRepository.count()).thenReturn(10L);
        when(bookRepository.count()).thenReturn(20L);
        when(orderRepository.count()).thenReturn(30L);
        when(categoryRepository.count()).thenReturn(5L);
        when(authorRepository.count()).thenReturn(8L);

        AdminMetricsResponse response = adminService.getMetrics();

        assertEquals(10L, response.users());
        assertEquals(20L, response.books());
        assertEquals(30L, response.orders());
        assertEquals(5L, response.categories());
        assertEquals(8L, response.authors());
    }
}

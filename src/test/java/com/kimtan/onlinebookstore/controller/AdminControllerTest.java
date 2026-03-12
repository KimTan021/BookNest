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
import com.kimtan.onlinebookstore.service.AdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    // ─── Users ────────────────────────────────────────────────────────────────

    @Test
    void createUserShouldDelegateToService() {
        AdminUserCreateRequest request = new AdminUserCreateRequest(
                "Kim", "Tan", "kim@example.com", "secret123", "ROLE_USER");
        AdminUserResponse expected = new AdminUserResponse(1L, "Kim", "Tan", "kim@example.com", "ROLE_USER", true);
        when(adminService.createUser(request)).thenReturn(expected);

        AdminUserResponse response = adminController.createUser(request);

        assertSame(expected, response);
        verify(adminService).createUser(request);
    }

    @Test
    void listUsersShouldDelegateToServiceWithQuery() {
        Page<AdminUserResponse> expected = new PageImpl<>(List.of(
                new AdminUserResponse(1L, "Kim", "Tan", "kim@example.com", "ROLE_USER", true)));
        when(adminService.listUsers("kim", 0, 10)).thenReturn(expected);

        Page<AdminUserResponse> response = adminController.listUsers("kim", 0, 10);

        assertSame(expected, response);
        verify(adminService).listUsers("kim", 0, 10);
    }

    @Test
    void listUsersShouldDelegateToServiceWithNullQuery() {
        Page<AdminUserResponse> expected = new PageImpl<>(List.of());
        when(adminService.listUsers(null, 0, 10)).thenReturn(expected);

        Page<AdminUserResponse> response = adminController.listUsers(null, 0, 10);

        assertSame(expected, response);
        verify(adminService).listUsers(null, 0, 10);
    }

    @Test
    void updateUserStatusShouldDelegateToService() {
        AdminUserResponse expected = new AdminUserResponse(1L, "Kim", "Tan", "kim@example.com", "ROLE_USER", false);
        when(adminService.setUserActive(1L, false)).thenReturn(expected);

        AdminUserResponse response = adminController.updateUserStatus(1L, false);

        assertSame(expected, response);
        verify(adminService).setUserActive(1L, false);
    }

    // ─── Books ────────────────────────────────────────────────────────────────

    @Test
    void createBookShouldDelegateToService() {
        AdminBookCreateRequest request = new AdminBookCreateRequest(
                "Dune", "Epic sci-fi", new BigDecimal("799.00"), 50, "dune.jpg", 1L, 2L);
        BookResponseDTO expected = BookResponseDTO.builder().id(10L).title("Dune").build();
        when(adminService.createBook(request)).thenReturn(expected);

        BookResponseDTO response = adminController.createBook(request);

        assertSame(expected, response);
        verify(adminService).createBook(request);
    }

    @Test
    void getBookDetailShouldDelegateToService() {
        AdminBookDetailResponse expected = new AdminBookDetailResponse(
                10L, "Dune", "desc", new BigDecimal("799.00"), 50,
                "dune.jpg", 1L, "Frank Herbert", 2L, "Science Fiction");
        when(adminService.getBookDetail(10L)).thenReturn(expected);

        AdminBookDetailResponse response = adminController.getBookDetail(10L);

        assertSame(expected, response);
        verify(adminService).getBookDetail(10L);
    }

    @Test
    void updateBookShouldDelegateToService() {
        AdminBookUpdateRequest request = new AdminBookUpdateRequest(
                "Dune Messiah", "Sequel", new BigDecimal("849.00"), 30, "dune2.jpg", 1L, 2L);
        BookResponseDTO expected = BookResponseDTO.builder().id(10L).title("Dune Messiah").build();
        when(adminService.updateBook(10L, request)).thenReturn(expected);

        BookResponseDTO response = adminController.updateBook(10L, request);

        assertSame(expected, response);
        verify(adminService).updateBook(10L, request);
    }

    @Test
    void deleteBookShouldDelegateToService() {
        adminController.deleteBook(10L);

        verify(adminService).deleteBook(10L);
    }

    // ─── Authors ──────────────────────────────────────────────────────────────

    @Test
    void listAuthorsShouldDelegateToService() {
        List<AdminAuthorResponse> expected = List.of(
                new AdminAuthorResponse(1L, "Frank Herbert", "Sci-fi legend"));
        when(adminService.listAuthors()).thenReturn(expected);

        List<AdminAuthorResponse> response = adminController.listAuthors();

        assertSame(expected, response);
        verify(adminService).listAuthors();
    }

    @Test
    void searchAuthorsShouldDelegateToService() {
        Page<AdminAuthorResponse> expected = new PageImpl<>(List.of(
                new AdminAuthorResponse(1L, "Frank Herbert", "Sci-fi legend")));
        when(adminService.listAuthorsPaged("frank", 0, 10)).thenReturn(expected);

        Page<AdminAuthorResponse> response = adminController.searchAuthors("frank", 0, 10);

        assertSame(expected, response);
        verify(adminService).listAuthorsPaged("frank", 0, 10);
    }

    @Test
    void createAuthorShouldDelegateToService() {
        AdminAuthorRequest request = new AdminAuthorRequest("Frank Herbert", "Sci-fi legend");
        AdminAuthorResponse expected = new AdminAuthorResponse(1L, "Frank Herbert", "Sci-fi legend");
        when(adminService.createAuthor(request)).thenReturn(expected);

        AdminAuthorResponse response = adminController.createAuthor(request);

        assertSame(expected, response);
        verify(adminService).createAuthor(request);
    }

    @Test
    void updateAuthorShouldDelegateToService() {
        AdminAuthorRequest request = new AdminAuthorRequest("Frank Herbert", "Updated bio");
        AdminAuthorResponse expected = new AdminAuthorResponse(1L, "Frank Herbert", "Updated bio");
        when(adminService.updateAuthor(1L, request)).thenReturn(expected);

        AdminAuthorResponse response = adminController.updateAuthor(1L, request);

        assertSame(expected, response);
        verify(adminService).updateAuthor(1L, request);
    }

    @Test
    void deleteAuthorShouldDelegateToService() {
        adminController.deleteAuthor(1L);

        verify(adminService).deleteAuthor(1L);
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @Test
    void listCategoriesShouldDelegateToService() {
        List<CategoryResponseDTO> expected = List.of(new CategoryResponseDTO(1L, "Science Fiction"));
        when(adminService.listCategories()).thenReturn(expected);

        List<CategoryResponseDTO> response = adminController.listCategories();

        assertSame(expected, response);
        verify(adminService).listCategories();
    }

    @Test
    void searchCategoriesShouldDelegateToService() {
        Page<CategoryResponseDTO> expected = new PageImpl<>(List.of(
                new CategoryResponseDTO(1L, "Science Fiction")));
        when(adminService.listCategoriesPaged("sci", 0, 10)).thenReturn(expected);

        Page<CategoryResponseDTO> response = adminController.searchCategories("sci", 0, 10);

        assertSame(expected, response);
        verify(adminService).listCategoriesPaged("sci", 0, 10);
    }

    @Test
    void createCategoryShouldDelegateToService() {
        AdminCategoryRequest request = new AdminCategoryRequest("Science Fiction");
        CategoryResponseDTO expected = new CategoryResponseDTO(1L, "Science Fiction");
        when(adminService.createCategory(request)).thenReturn(expected);

        CategoryResponseDTO response = adminController.createCategory(request);

        assertSame(expected, response);
        verify(adminService).createCategory(request);
    }

    @Test
    void updateCategoryShouldDelegateToService() {
        AdminCategoryRequest request = new AdminCategoryRequest("Sci-Fi");
        CategoryResponseDTO expected = new CategoryResponseDTO(1L, "Sci-Fi");
        when(adminService.updateCategory(1L, request)).thenReturn(expected);

        CategoryResponseDTO response = adminController.updateCategory(1L, request);

        assertSame(expected, response);
        verify(adminService).updateCategory(1L, request);
    }

    @Test
    void deleteCategoryShouldDelegateToService() {
        adminController.deleteCategory(1L);

        verify(adminService).deleteCategory(1L);
    }

    // ─── Metrics ──────────────────────────────────────────────────────────────

    @Test
    void getMetricsShouldDelegateToService() {
        AdminMetricsResponse expected = new AdminMetricsResponse(100L, 250L, 80L, 15L, 40L);
        when(adminService.getMetrics()).thenReturn(expected);

        AdminMetricsResponse response = adminController.getMetrics();

        assertSame(expected, response);
        verify(adminService).getMetrics();
    }
}

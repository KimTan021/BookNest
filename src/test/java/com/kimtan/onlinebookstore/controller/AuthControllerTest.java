package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.auth.AuthResponse;
import com.kimtan.onlinebookstore.dto.auth.LoginRequest;
import com.kimtan.onlinebookstore.dto.auth.RegisterRequest;
import com.kimtan.onlinebookstore.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerShouldDelegateToService() {
        RegisterRequest request = new RegisterRequest("Kim", "Tan", "kim@example.com", "secret123");
        AuthResponse expected = new AuthResponse("jwt-token", "Bearer", 3600L);
        when(authService.register("Kim", "Tan", "kim@example.com", "secret123")).thenReturn(expected);

        AuthResponse response = authController.register(request);

        assertSame(expected, response);
        verify(authService).register("Kim", "Tan", "kim@example.com", "secret123");
    }

    @Test
    void loginShouldDelegateToService() {
        LoginRequest request = new LoginRequest("kim@example.com", "secret123");
        AuthResponse expected = new AuthResponse("jwt-token", "Bearer", 3600L);
        when(authService.login("kim@example.com", "secret123")).thenReturn(expected);

        AuthResponse response = authController.login(request);

        assertSame(expected, response);
        verify(authService).login("kim@example.com", "secret123");
    }
}

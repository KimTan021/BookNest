package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.auth.LoginRequest;
import com.kimtan.onlinebookstore.dto.auth.RegisterRequest;
import com.kimtan.onlinebookstore.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import com.kimtan.onlinebookstore.dto.auth.AuthResponse;

@ExtendWith(MockitoExtension.class)
class AuthControllerWebMvcTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("Kim", "Tan", "kim@test.com", "secret123");
        loginRequest = new LoginRequest("kim@test.com", "secret123");
    }

    @Test
    void registerDelegatesToService() {
        when(authService.register("Kim", "Tan", "kim@test.com", "secret123"))
                .thenReturn(new AuthResponse("token", "Bearer", 3600));
        authController.register(registerRequest);

        verify(authService).register("Kim", "Tan", "kim@test.com", "secret123");
    }

    @Test
    void loginDelegatesToService() {
        when(authService.login("kim@test.com", "secret123"))
                .thenReturn(new AuthResponse("token", "Bearer", 3600));
        authController.login(loginRequest);

        verify(authService).login("kim@test.com", "secret123");
    }
}

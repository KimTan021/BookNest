package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.auth.LoginRequest;
import com.kimtan.onlinebookstore.dto.auth.RegisterRequest;
import com.kimtan.onlinebookstore.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        authService.register(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password()
        );
        return "User registered successfully";
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        authService.login(request.email(), request.password());
        return "Login successful";
    }
}

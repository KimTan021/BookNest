package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.auth.AuthResponse;
import com.kimtan.onlinebookstore.dto.auth.LoginRequest;
import com.kimtan.onlinebookstore.dto.auth.RegisterRequest;
import com.kimtan.onlinebookstore.exception.ApiError;
import com.kimtan.onlinebookstore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Register a new user",
            description = "Creates a customer account and returns a JWT access token.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User registered successfully", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password()
        );
    }

    @PostMapping("/login")
    @Operation(
            summary = "Authenticate a user",
            description = "Returns a JWT access token for a valid email and password.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class))),
                    @ApiResponse(responseCode = "401", description = "Invalid credentials", content = @Content(schema = @Schema(implementation = ApiError.class)))
            }
    )
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }
}

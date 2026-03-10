package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.auth.AuthResponse;
import com.kimtan.onlinebookstore.security.JwtAuthenticationFilter;
import com.kimtan.onlinebookstore.security.JwtUtil;
import com.kimtan.onlinebookstore.service.AuthService;
import com.kimtan.onlinebookstore.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void registerShouldReturnTokenPayload() throws Exception {
        AuthResponse response = new AuthResponse("jwt-token", "Bearer", 3600L);
        String requestBody = """
                {
                  "firstName": "Kim",
                  "lastName": "Tan",
                  "email": "kim@example.com",
                  "password": "secret123"
                }
                """;

        when(authService.register(
                eq("Kim"),
                eq("Tan"),
                eq("kim@example.com"),
                eq("secret123")
        )).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(3600));

        verify(authService).register("Kim", "Tan", "kim@example.com", "secret123");
    }

    @Test
    void registerShouldReturnBadRequestWhenPayloadIsInvalid() throws Exception {
        String requestBody = """
                {
                  "firstName": "",
                  "lastName": "Tan",
                  "email": "kim@example.com",
                  "password": "secret123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("First name is required"))
                .andExpect(jsonPath("$.status").value(400));
    }
}

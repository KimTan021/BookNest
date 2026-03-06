package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.ConflictException;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import com.kimtan.onlinebookstore.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerThrowsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                authService.register("Kim", "Tan", "taken@test.com", "secret123"));
    }

    @Test
    void registerSavesUserAndCart() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("ENC(secret123)");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(any(User.class))).thenReturn("token-123");
        when(jwtUtil.getExpirationInSeconds()).thenReturn(3600L);

        var response = authService.register("Kim", "Tan", "new@test.com", "secret123");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("Kim", savedUser.getFirstName());
        assertEquals("Tan", savedUser.getLastName());
        assertEquals("new@test.com", savedUser.getEmail());
        assertEquals("ENC(secret123)", savedUser.getPassword());
        assertEquals("ROLE_USER", savedUser.getRole());

        ArgumentCaptor<Cart> cartCaptor = ArgumentCaptor.forClass(Cart.class);
        verify(cartRepository).save(cartCaptor.capture());
        assertEquals(savedUser, cartCaptor.getValue().getUser());
        assertNotNull(response);
        assertEquals("token-123", response.accessToken());
    }

    @Test
    void loginDelegatesToAuthenticationManagerAndReturnsToken() {
        User principal = User.builder()
                .email("user@test.com")
                .password("pw")
                .role("ROLE_USER")
                .build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("user@test.com", "secret123")
        )).thenReturn(authentication);
        when(jwtUtil.generateToken(principal)).thenReturn("token-123");
        when(jwtUtil.getExpirationInSeconds()).thenReturn(3600L);

        var response = authService.login("user@test.com", "secret123");

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken("user@test.com", "secret123")
        );
        assertEquals("token-123", response.accessToken());
    }
}

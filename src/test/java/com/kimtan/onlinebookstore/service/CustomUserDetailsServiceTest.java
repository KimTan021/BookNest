package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadUserByUsernameShouldReturnPersistedUser() {
        User user = User.builder().id(1L).email("kim@example.com").password("encoded").role("ROLE_USER").build();
        when(userRepository.findByEmail("kim@example.com")).thenReturn(Optional.of(user));

        UserDetails response = customUserDetailsService.loadUserByUsername("kim@example.com");

        assertEquals("kim@example.com", response.getUsername());
        assertEquals("encoded", response.getPassword());
    }

    @Test
    void loadUserByUsernameShouldThrowWhenEmailDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("missing@example.com")
        );

        assertEquals("User not found", exception.getMessage());
    }
}

package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.exception.ConflictException;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public void register(String firstName,
                         String lastName,
                         String email,
                         String password) {

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role("ROLE_USER")
                .build();

        userRepository.save(user);

        // Create cart automatically
        Cart cart = Cart.builder()
                .user(user)
                .build();

        cartRepository.save(cart);
    }

    public void login(String email, String password) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }
}

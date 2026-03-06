package com.kimtan.onlinebookstore.service;

import com.kimtan.onlinebookstore.dto.auth.AuthResponse;
import com.kimtan.onlinebookstore.exception.ConflictException;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import com.kimtan.onlinebookstore.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthResponse register(String firstName,
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

        User savedUser = userRepository.save(user);

        // Create cart automatically
        Cart cart = Cart.builder()
                .user(savedUser)
                .build();

        cartRepository.save(cart);

        String token = jwtUtil.generateToken(savedUser);
        return new AuthResponse(token, "Bearer", jwtUtil.getExpirationInSeconds());
    }

    public AuthResponse login(String email, String password) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, "Bearer", jwtUtil.getExpirationInSeconds());
    }
}

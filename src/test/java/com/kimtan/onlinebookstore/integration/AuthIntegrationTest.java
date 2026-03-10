package com.kimtan.onlinebookstore.integration;

import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.flyway.enabled=false")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @AfterEach
    void cleanUp() {
        cartRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerShouldPersistUserAndCreateCart() throws Exception {
        String email = "reader-" + UUID.randomUUID() + "@example.com";
        String requestBody = """
                {
                  "firstName": "Kim",
                  "lastName": "Tan",
                  "email": "%s",
                  "password": "secret123"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(3600));

        User savedUser = userRepository.findByEmail(email).orElseThrow();

        assertNotNull(savedUser.getId());
        assertTrue(savedUser.getPassword().startsWith("$2"));
        assertTrue(cartRepository.findByUserId(savedUser.getId()).isPresent());
    }
}

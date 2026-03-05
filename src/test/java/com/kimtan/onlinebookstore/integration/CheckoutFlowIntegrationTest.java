package com.kimtan.onlinebookstore.integration;

import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Cart;
import com.kimtan.onlinebookstore.entity.CartItem;
import com.kimtan.onlinebookstore.entity.Category;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.repository.AuthorRepository;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CartItemRepository;
import com.kimtan.onlinebookstore.repository.CartRepository;
import com.kimtan.onlinebookstore.repository.CategoryRepository;
import com.kimtan.onlinebookstore.repository.OrderItemRepository;
import com.kimtan.onlinebookstore.repository.OrderRepository;
import com.kimtan.onlinebookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CheckoutFlowIntegrationTest {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Book testBook;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAllInBatch();
        cartItemRepository.deleteAllInBatch();
        orderRepository.deleteAllInBatch();
        cartRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        Author author = authorRepository.save(Author.builder()
                .name("Test Author")
                .build());
        Category category = categoryRepository.save(Category.builder()
                .name("Test Category " + UUID.randomUUID())
                .build());
        testBook = bookRepository.save(Book.builder()
                .title("Integration Book")
                .description("Book for integration tests")
                .price(new BigDecimal("20.00"))
                .stock(10)
                .author(author)
                .category(category)
                .build());

        testUser = userRepository.save(User.builder()
                .firstName("Integration")
                .lastName("User")
                .email("integration@test.com")
                .password(passwordEncoder.encode("secret123"))
                .role("ROLE_USER")
                .build());

        Cart cart = cartRepository.save(Cart.builder()
                .user(testUser)
                .build());

        cartItemRepository.save(CartItem.builder()
                .cart(cart)
                .book(testBook)
                .quantity(2)
                .build());
    }

    @Test
    void checkoutEndpointCompletesEndToEndFlow() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url("/api/orders/checkout")))
                .header("Authorization", basicAuth("integration@test.com", "secret123"))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(HttpStatus.OK.value(), response.statusCode());
        assertTrue(response.body() != null && response.body().contains("\"status\":\"PLACED\""));
        assertTrue(response.body() != null && response.body().contains("\"totalAmount\":40.00"));

        assertEquals(1, orderRepository.findByUserIdOrderByCreatedAtDesc(testUser.getId()).size());
        assertEquals(8, bookRepository.findById(testBook.getId()).orElseThrow().getStock());
        Long cartId = cartRepository.findByUserId(testUser.getId()).orElseThrow().getId();
        assertTrue(cartItemRepository.findByCartIdAndBookId(cartId, testBook.getId()).isEmpty());
    }

    private String basicAuth(String username, String password) {
        String credentials = username + ":" + password;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }
}

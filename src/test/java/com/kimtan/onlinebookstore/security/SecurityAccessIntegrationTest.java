package com.kimtan.onlinebookstore.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SecurityAccessIntegrationTest {

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void booksEndpointIsPublic() throws Exception {
        HttpResponse<String> response = sendGet("/api/books", null);
        assertEquals(HttpStatus.OK.value(), response.statusCode());
    }

    @Test
    void authEndpointIsPublic() throws Exception {
        HttpResponse<String> response = sendPost(
                "/api/auth/login",
                "{\"email\":\"bad-email\",\"password\":\"x\"}",
                null
        );
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.statusCode());
    }

    @Test
    void ordersEndpointRequiresAuthentication() throws Exception {
        HttpResponse<String> response = sendGet("/api/orders/history", null);
        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.statusCode());
    }

    @Test
    void ordersEndpointRejectsInvalidCredentials() throws Exception {
        HttpResponse<String> response = sendGet(
                "/api/orders/history",
                basicAuth("nouser@test.com", "wrong")
        );
        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.statusCode());
    }

    private HttpResponse<String> sendGet(String path, String authHeader) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET();
        if (authHeader != null) {
            builder.header("Authorization", authHeader);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendPost(String path, String body, String authHeader) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        if (authHeader != null) {
            builder.header("Authorization", authHeader);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private String basicAuth(String username, String password) {
        String credentials = username + ":" + password;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }
}

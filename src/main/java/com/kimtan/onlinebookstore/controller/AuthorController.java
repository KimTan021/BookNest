package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.AuthorDetailsResponseDTO;
import com.kimtan.onlinebookstore.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping("/{id}")
    public AuthorDetailsResponseDTO getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id);
    }
}

package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.FavoriteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteControllerTest {

    @Mock
    private FavoriteService favoriteService;

    @InjectMocks
    private FavoriteController favoriteController;

    private final User mockUser = User.builder().id(123L).build();

    @Test
    void getFavoritesShouldDelegateToService() {
        List<BookResponseDTO> expected = List.of();
        when(favoriteService.getFavorites(123L)).thenReturn(expected);

        List<BookResponseDTO> response = favoriteController.getFavorites(mockUser);

        assertSame(expected, response);
        verify(favoriteService).getFavorites(123L);
    }

    @Test
    void addToFavoritesShouldDelegateToService() {
        favoriteController.addToFavorites(mockUser, 456L);

        verify(favoriteService).addToFavorites(123L, 456L);
    }

    @Test
    void removeFromFavoritesShouldDelegateToService() {
        favoriteController.removeFromFavorites(mockUser, 456L);

        verify(favoriteService).removeFromFavorites(123L, 456L);
    }

    @Test
    void requireUserShouldThrowWhenUserIsNull() {
        assertThrows(UnauthorizedException.class, () -> favoriteController.getFavorites(null));
    }
}

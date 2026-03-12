package com.kimtan.onlinebookstore.controller;

import com.kimtan.onlinebookstore.dto.BookResponseDTO;
import com.kimtan.onlinebookstore.entity.User;
import com.kimtan.onlinebookstore.exception.UnauthorizedException;
import com.kimtan.onlinebookstore.service.WishlistService;
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
class WishlistControllerTest {

    @Mock
    private WishlistService wishlistService;

    @InjectMocks
    private WishlistController wishlistController;

    private final User mockUser = User.builder().id(123L).build();

    @Test
    void getWishlistShouldDelegateToService() {
        List<BookResponseDTO> expected = List.of();
        when(wishlistService.getWishlist(123L)).thenReturn(expected);

        List<BookResponseDTO> response = wishlistController.getWishlist(mockUser);

        assertSame(expected, response);
        verify(wishlistService).getWishlist(123L);
    }

    @Test
    void addToWishlistShouldDelegateToService() {
        wishlistController.addToWishlist(mockUser, 456L);

        verify(wishlistService).addToWishlist(123L, 456L);
    }

    @Test
    void removeFromWishlistShouldDelegateToService() {
        wishlistController.removeFromWishlist(mockUser, 456L);

        verify(wishlistService).removeFromWishlist(123L, 456L);
    }

    @Test
    void requireUserShouldThrowWhenUserIsNull() {
        assertThrows(UnauthorizedException.class, () -> wishlistController.getWishlist(null));
    }
}

package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.session.UserSessionsService;
import com.anteiku.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserCredentialsRepository userCredentialsRepository;
    @Mock
    private UserSessionsService userSessionsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void authUserSuccessTest() {
        UserAuthDto loginDto = new UserAuthDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("TestPassword123!");
        UUID userId = UUID.randomUUID();

        UserCredentialsEntity userCredentialsEntity = new UserCredentialsEntity();
        userCredentialsEntity.setUserId(userId);
        userCredentialsEntity.setPassword("hashedPassword");

        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setUsername("test");
        user.setRole(Role.USER);
        user.setCreatedAt(Instant.now());

        UserSessionDto userSessionDto = new UserSessionDto();
        userSessionDto.setId(UUID.randomUUID());

        when(userCredentialsRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userCredentialsEntity));
        when(passwordEncoder.matches("TestPassword123!", "hashedPassword")).thenReturn(true);
        when(userRepository.findUserById(userId)).thenReturn(Optional.of(user));
        when(userSessionsService.createNewSession("test@example.com")).thenReturn(userSessionDto);
        when(userSessionsService.getUserSessionAuthTokens(userSessionDto.getId())).thenReturn(new UserAuthTokensDto());

        UserAuthResponseDto response = authService.authenticateUser(loginDto);

        assertNotNull(response);
        assertEquals("test", response.getUserInfo().getUsername());
        verify(userSessionsService, times(1)).createNewSession("test@example.com");
    }

    @Test
    void authUserInvalidPasswordTest() {
        UserAuthDto loginDto = new UserAuthDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("WrongPassword");

        UserCredentialsEntity userCredentialsEntity = new UserCredentialsEntity();
        userCredentialsEntity.setPassword("hashedPassword");

        when(userCredentialsRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userCredentialsEntity));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.authenticateUser(loginDto));

        verify(userSessionsService, never()).createNewSession(anyString());
    }

    @Test
    void authUserNotFoundTest() {
        UserAuthDto loginDto = new UserAuthDto();
        loginDto.setEmail("noone@dota.com");

        when(userCredentialsRepository.findByEmail("noone@dota.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.authenticateUser(loginDto));
    }
}

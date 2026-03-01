package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.session.UserSessionsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserRepository userRepository;
    @Mock private UserCredentialsRepository userCredentialsRepository;
    @Mock private UserSessionsService userSessionsService;

    @InjectMocks private AuthService authService;

    private static final String EMAIL = "test@example.com";
    private static final String RAW_PASSWORD = "password123";
    private static final String WRONG_PASSWORD = "wrongPassword";
    private static final String ENCODED_PASSWORD = "encodedPassword";
    private static final String ACCESS = "access";
    private static final String REFRESH = "refresh";
    private static final Role ROLE = Role.USER;
    private static final String USERNAME = "testuser";

    @Test
    void authenticateUser_success() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        UserAuthDto authDto = authDto(EMAIL, RAW_PASSWORD);
        UserCredentialsEntity credentials = credentials(userId, EMAIL, ENCODED_PASSWORD);
        UserEntity userEntity = userEntity(userId, USERNAME, ROLE);

        UserSessionDto sessionDto = new UserSessionDto();
        sessionDto.setId(sessionId);

        UserAuthTokensDto tokensDto = new UserAuthTokensDto();
        tokensDto.setAccessToken(ACCESS);
        tokensDto.setRefreshToken(REFRESH);

        when(userCredentialsRepository.findByEmail(EMAIL)).thenReturn(Optional.of(credentials));
        when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
        when(userRepository.findUserById(userId)).thenReturn(Optional.of(userEntity));
        when(userSessionsService.createNewSession(EMAIL)).thenReturn(sessionDto);
        when(userSessionsService.getUserSessionAuthTokens(sessionId)).thenReturn(tokensDto);

        UserAuthResponseDto response = authService.authenticateUser(authDto);

        assertThat(response).isNotNull();

        assertThat(response.getAuthTokens()).satisfies(t -> {
            assertThat(t.getAccessToken()).isEqualTo(ACCESS);
            assertThat(t.getRefreshToken()).isEqualTo(REFRESH);
        });

        assertThat(response.getUserInfo()).satisfies(u -> {
            assertThat(u.getId()).isEqualTo(userId);
            assertThat(u.getEmail()).isEqualTo(EMAIL);
            assertThat(u.getUsername()).isEqualTo(USERNAME);
            assertThat(u.getRole()).isEqualTo(ROLE.name());
        });

        InOrder inOrder = inOrder(userCredentialsRepository, passwordEncoder, userRepository, userSessionsService);
        inOrder.verify(userCredentialsRepository).findByEmail(EMAIL);
        inOrder.verify(passwordEncoder).matches(RAW_PASSWORD, ENCODED_PASSWORD);
        inOrder.verify(userRepository).findUserById(userId);
        inOrder.verify(userSessionsService).createNewSession(EMAIL);
        inOrder.verify(userSessionsService).getUserSessionAuthTokens(sessionId);

        verifyNoMoreInteractions(userCredentialsRepository, passwordEncoder, userRepository, userSessionsService);
    }

    @Test
    void authenticateUser_credentialsNotFound() {
        UserAuthDto authDto = authDto(EMAIL, RAW_PASSWORD);

        when(userCredentialsRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticateUser(authDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found: " + EMAIL);

        verify(userCredentialsRepository).findByEmail(EMAIL);
        verifyNoMoreInteractions(userCredentialsRepository);
        verifyNoInteractions(passwordEncoder, userRepository, userSessionsService);
    }

    @Test
    void authenticateUser_invalidPassword() {
        UUID userId = UUID.randomUUID();
        UserAuthDto authDto = authDto(EMAIL, WRONG_PASSWORD);
        UserCredentialsEntity credentials = credentials(userId, EMAIL, ENCODED_PASSWORD);

        when(userCredentialsRepository.findByEmail(EMAIL)).thenReturn(Optional.of(credentials));
        when(passwordEncoder.matches(WRONG_PASSWORD, ENCODED_PASSWORD)).thenReturn(false);

        assertThatThrownBy(() -> authService.authenticateUser(authDto))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid password");

        verify(userCredentialsRepository).findByEmail(EMAIL);
        verify(passwordEncoder).matches(WRONG_PASSWORD, ENCODED_PASSWORD);

        verifyNoMoreInteractions(userCredentialsRepository, passwordEncoder);
        verifyNoInteractions(userRepository, userSessionsService);
    }

    @Test
    void authenticateUser_userEntityNotFound() {
        UUID userId = UUID.randomUUID();
        UserAuthDto authDto = authDto(EMAIL, RAW_PASSWORD);
        UserCredentialsEntity credentials = credentials(userId, EMAIL, ENCODED_PASSWORD);

        when(userCredentialsRepository.findByEmail(EMAIL)).thenReturn(Optional.of(credentials));
        when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
        when(userRepository.findUserById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticateUser(authDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found: " + userId);

        verify(userCredentialsRepository).findByEmail(EMAIL);
        verify(passwordEncoder).matches(RAW_PASSWORD, ENCODED_PASSWORD);
        verify(userRepository).findUserById(userId);

        verifyNoMoreInteractions(userCredentialsRepository, passwordEncoder, userRepository);
        verifyNoInteractions(userSessionsService);
    }

    @Test
    void refreshAuthTokens_success() {
        String refreshToken = "some-refresh-token";

        UserAuthTokensDto expected = new UserAuthTokensDto();
        expected.setAccessToken("new-access");
        expected.setRefreshToken("new-refresh");

        when(userSessionsService.refreshSession(refreshToken)).thenReturn(expected);

        UserAuthTokensDto actual = authService.refreshAuthTokens(refreshToken);

        assertThat(actual).isNotNull();
        assertThat(actual.getAccessToken()).isEqualTo("new-access");
        assertThat(actual.getRefreshToken()).isEqualTo("new-refresh");

        verify(userSessionsService).refreshSession(refreshToken);
        verifyNoMoreInteractions(userSessionsService);
    }

    @Test
    void refreshAuthTokens_propagatesException() {
        String refreshToken = "invalid-token";
        when(userSessionsService.refreshSession(refreshToken))
                .thenThrow(new RuntimeException("Session expired"));

        assertThatThrownBy(() -> authService.refreshAuthTokens(refreshToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Session expired");

        verify(userSessionsService).refreshSession(refreshToken);
        verifyNoMoreInteractions(userSessionsService);
    }

    // ===== helpers =====

    private static UserAuthDto authDto(String email, String password) {
        UserAuthDto dto = new UserAuthDto();
        dto.setEmail(email);
        dto.setPassword(password);
        return dto;
    }

    private static UserCredentialsEntity credentials(UUID userId, String email, String password) {
        return UserCredentialsEntity.builder()
                .userId(userId)
                .email(email)
                .password(password)
                .build();
    }

    private static UserEntity userEntity(UUID id, String username, Role role) {
        return UserEntity.builder()
                .id(id)
                .username(username)
                .role(role)
                .build();
    }
}
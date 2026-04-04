package com.anteiku.backend.security.sessionTests;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.exception.UserSessionNotFound;
import com.anteiku.backend.mapper.UserSessionMapper;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.repository.UserSessionsRepository;
import com.anteiku.backend.security.config.SecurityProperties;
import com.anteiku.backend.security.jwt.JwtService;
import com.anteiku.backend.security.session.UserSessionsService;
import com.anteiku.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserSessionsServiceTests {
    @Mock
    private UserSessionsRepository userSessionsRepository;
    @Mock
    private UserSessionMapper userSessionMapper;
    @Mock
    private UserService userService;
    @Mock
    private SecurityProperties securityProperties;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserSessionsService userSessionsService;

    @Test
    void logoutSuccessTest() {
        String token = "valid-access-token";
        UserSessionEntity userSessionEntity = new UserSessionEntity();
        userSessionEntity.setRevoked(false);
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));

        userSessionsService.logout(token);

        ArgumentCaptor<UserSessionEntity> captor = ArgumentCaptor.forClass(UserSessionEntity.class);
        verify(userSessionsRepository, times(1)).save(captor.capture());
        assertTrue(captor.getValue().getRevoked());
        assertNotNull(captor.getValue().getRevokedAt());
    }

    @Test
    void logoutNullTokenTest() {
        userSessionsService.logout(null);
        verify(userSessionsRepository, never()).findByAccessToken(any());
        verify(userSessionsRepository, never()).save(any());
    }

    @Test
    void logoutSessionNotFoundTest() {
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.empty());
        assertThrows(UserSessionNotFound.class, () -> userSessionsService.logout("fake-token"));
    }

    @Test
    void logoutAlreadyRevokedTest() {
        UserSessionEntity userSessionEntity = new UserSessionEntity();
        userSessionEntity.setRevoked(true);
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));

        assertThrows(UserIsNotAuthorized.class, () -> userSessionsService.logout("revoked-token"));
    }

    @Test
    void isSessionLoggedOutTrueTest() {
        UserSessionEntity userSessionEntity = new UserSessionEntity();
        userSessionEntity.setRevoked(true);
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));

        assertTrue(userSessionsService.isSessionLoggedOut("something-hihi"));
    }

    @Test
    void isSessionLoggedOutFalseTest() {
        UserSessionEntity userSessionEntity = new UserSessionEntity();
        userSessionEntity.setRevoked(false);
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));

        assertFalse(userSessionsService.isSessionLoggedOut("something-revoked"));
    }

    @Test
    void isSessionLoggedOutNotFoundTest() {
        when(userSessionsRepository.findByAccessToken(any(byte[].class))).thenReturn(Optional.empty());
        assertFalse(userSessionsService.isSessionLoggedOut("no-token"));
    }

    @Test
    void createNewSessionSuccessTest() {
        String email = "test@example.com";
        UUID userId = UUID.randomUUID();

        UserCredentialsDto userCredentials = new UserCredentialsDto();
        userCredentials.setUserId(userId);

        when(userService.getUserCredentialsByEmail(email)).thenReturn(userCredentials);
        when(securityProperties.getRefreshTokenExpirationPeriod()).thenReturn(7L);
        when(securityProperties.getAccessTokenExpirationPeriod()).thenReturn(1L);
        when(jwtService.generateToken(email)).thenReturn("jwt-token");

        UserSessionEntity userSessionEntity = new UserSessionEntity();
        UserSessionDto userSessionDto = new UserSessionDto();
        userSessionDto.setAccessToken("jwt-token");

        when(userSessionMapper.toEntity(any(UserSessionDto.class))).thenReturn(userSessionEntity);
        when(userSessionsRepository.save(userSessionEntity)).thenReturn(userSessionEntity);
        when(userSessionMapper.toDto(userSessionEntity)).thenReturn(userSessionDto);

        UserSessionDto res = userSessionsService.createNewSession(email);

        assertNotNull(res);
        assertEquals("jwt-token", res.getAccessToken());
        verify(userSessionsRepository, times(1)).save(any(UserSessionEntity.class));
    }

    @Test
    void refreshSessionSuccessTest() {
        String oldRefreshToken = "old-jwt-token";
        UUID userId = UUID.randomUUID();

        UserSessionDto oldUserSessionDto = new UserSessionDto();
        oldUserSessionDto.setUserId(userId);
        oldUserSessionDto.setRefreshTokenExpiresAt(OffsetDateTime.now().plusDays(5));

        UserSessionEntity userSessionEntity = new UserSessionEntity();
        when(userSessionsRepository.findByRefreshToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));
        when(userSessionMapper.toDto(userSessionEntity)).thenReturn(oldUserSessionDto);

        UserCredentialsDto userCredentials = new UserCredentialsDto();
        userCredentials.setEmail("test@example.com");
        when(userService.getUserCredentialsById(userId)).thenReturn(userCredentials);
        when(securityProperties.getRefreshTokenExpirationPeriod()).thenReturn(7L);
        when(securityProperties.getAccessTokenExpirationPeriod()).thenReturn(1L);
        when(jwtService.generateToken("test@example.com")).thenReturn("new-jwt-token");
        when(userSessionMapper.toEntity(any(UserSessionDto.class))).thenReturn(userSessionEntity);

        UserAuthTokensDto userAuthTokensDto = userSessionsService.refreshSession(oldRefreshToken);

        assertNotNull(userAuthTokensDto);
        assertEquals("new-jwt-token", userAuthTokensDto.getAccessToken());
        assertNotNull(userAuthTokensDto.getRefreshToken());
        verify(userSessionsRepository, times(1)).save(any());
    }

    @Test
    void refreshSessionExpiredTest() {
        String oldRefreshToken = "old-jwt-token";
        UserSessionDto oldUserSessionDto = new UserSessionDto();
        oldUserSessionDto.setRefreshTokenExpiresAt(OffsetDateTime.now().minusDays(1));

        UserSessionEntity userSessionEntity = new UserSessionEntity();
        when(userSessionsRepository.findByRefreshToken(any(byte[].class))).thenReturn(Optional.of(userSessionEntity));
        when(userSessionMapper.toDto(userSessionEntity)).thenReturn(oldUserSessionDto);

        assertThrows(UserIsNotAuthorized.class, () -> userSessionsService.refreshSession(oldRefreshToken));
        verify(userSessionsRepository, never()).save(any());
    }

    @Test
    void getUserSessionAuthTokenSuccessTest() {
        UUID sessionId = UUID.randomUUID();
        UserSessionEntity userSessionEntity = new UserSessionEntity();
        UserSessionDto userSessionDto = new UserSessionDto();
        userSessionDto.setAccessToken("access-token");
        userSessionDto.setRefreshToken("refresh-token");
        userSessionDto.setRefreshTokenExpiresAt(OffsetDateTime.now().plusDays(1));
        when(userSessionsRepository.findById(sessionId)).thenReturn(Optional.of(userSessionEntity));
        when(userSessionMapper.toDto(userSessionEntity)).thenReturn(userSessionDto);

        UserAuthTokensDto res = userSessionsService.getUserSessionAuthTokens(sessionId);

        assertEquals("access-token", res.getAccessToken());
        assertEquals("refresh-token", res.getRefreshToken());
    }
}

package com.anteiku.backend.security.session;

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
import com.anteiku.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSessionsService {
    final private UserSessionsRepository userSessionsRepository;
    final private UserSessionMapper userSessionMapper;
    final private UserService userService;
    final private SecurityProperties securityProperties;
    final private JwtService jwtService;

    public void logout(String accessToken) {
        if (accessToken == null) {
            return;
        }

        Optional<UserSessionEntity> userSession = userSessionsRepository.findByAccessToken(accessToken.getBytes());
        if (userSession.isEmpty()) {
            throw new UserSessionNotFound(accessToken);
        }

        if (userSession.get().getRevoked() == true) {
            throw new UserIsNotAuthorized(accessToken);
        }

        // we can delete the line or mark it as "revoked"
        // userSessionsRepository.deleteById(userSession.get().getId());
        userSession.get().setRevoked(true);
        userSession.get().setRevokedAt(Instant.now());
        userSessionsRepository.save(userSession.get());
    }

    public boolean isSessionLoggedOut(String accessToken) {
        Optional<UserSessionEntity> sessionEntity = userSessionsRepository.findByAccessToken(accessToken.getBytes());
        if (sessionEntity.isEmpty()) {
            return false;
        }
        return sessionEntity.get().getRevoked();
    }

    public UserSessionDto getSessionByRefreshToken(String refreshToken) {
        return userSessionMapper.toDto(userSessionsRepository.findByRefreshToken(refreshToken.getBytes())
                .orElseThrow(() -> new UserSessionNotFound("User session not found")));
    }

    public UserSessionEntity updateUserSession(UserSessionDto session) {
        return userSessionsRepository.save(userSessionMapper.toEntity(session));
    }

    public void updateUserSession(UserSessionEntity session) {
        userSessionsRepository.save(session);
    }

    public UserSessionDto createNewSession(String userEmail) {
        OffsetDateTime timeNow = OffsetDateTime.now();
        UserCredentialsDto userCredentialsDto = userService.getUserCredentialsByEmail(userEmail);

        UserSessionDto userSession = new UserSessionDto();
        userSession.setUserId(userCredentialsDto.getUserId());
        userSession.setRefreshToken(UUID.randomUUID().toString());
        userSession.setRefreshTokenExpiresAt(timeNow.plus(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod())));
        userSession.setAccessToken(jwtService.generateToken(userEmail));
        userSession.setAccessTokenExpiresAt(timeNow.plus(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod())));
        userSession.setLastActiveAt(timeNow);
        userSession.setCreatedAt(timeNow);

        return userSessionMapper.toDto(updateUserSession(userSession));
    }

    public UserAuthTokensDto refreshSession(String refreshToken) {
        UserSessionDto session = getSessionByRefreshToken(refreshToken);

        if (session.getRefreshTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UserIsNotAuthorized("User is not authorized");
        }

        UserCredentialsDto userCredentialsDto = userService.getUserCredentialsById(session.getUserId());

        session.setRefreshToken(UUID.randomUUID().toString());
        session.setRefreshTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod())));
        session.setAccessToken(jwtService.generateToken(userCredentialsDto.getEmail()));
        session.setAccessTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod())));
        session.setLastActiveAt(OffsetDateTime.now());

        updateUserSession(session);

        UserAuthTokensDto newAuthTokens = new UserAuthTokensDto();
        newAuthTokens.setRefreshToken(session.getRefreshToken());
        newAuthTokens.setRefreshTokenExpiresAt(session.getRefreshTokenExpiresAt());
        newAuthTokens.setAccessToken(session.getAccessToken());

        return newAuthTokens;
    }

    public UserAuthTokensDto getUserSessionAuthTokens(UUID sessionId) {
        Optional<UserSessionEntity> userSessionEntityOpt = userSessionsRepository.findById(sessionId);
        if (userSessionEntityOpt.isEmpty()) {
            throw new UserSessionNotFound("User session not found");
        }

        UserSessionDto userSessionDto = userSessionMapper.toDto(userSessionEntityOpt.get());

        UserAuthTokensDto userAuthTokensDto = new UserAuthTokensDto();
        userAuthTokensDto.setRefreshToken(userSessionDto.getRefreshToken());
        userAuthTokensDto.setRefreshTokenExpiresAt(userSessionDto.getRefreshTokenExpiresAt());
        userAuthTokensDto.setAccessToken(userSessionDto.getAccessToken());

        return userAuthTokensDto;
    }
}

package com.anteiku.backend.security.session;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.exception.InvalidToken;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.exception.UserSessionNotFound;
import com.anteiku.backend.mapper.UserSessionMapper;
import com.anteiku.backend.mapper.UserSessionMapperImpl;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserSessionsRepository;
import com.anteiku.backend.security.config.SecurityProperties;
import com.anteiku.backend.security.jwt.JwtServiceImpl;
import com.anteiku.backend.service.UserServiceImpl;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSessionsServiceImpl implements UserSessionsService {
    final private UserSessionsRepository userSessionsRepository;
    final private UserSessionMapper userSessionMapper;
    final private UserServiceImpl  userServiceImpl;
    final private SecurityProperties securityProperties;
    final private JwtServiceImpl jwtServiceImpl;

    @Override
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

    @Override
    public boolean isSessionLoggedOut(String accessToken) {
        Optional<UserSessionEntity> sessionEntity = userSessionsRepository.findByAccessToken(accessToken.getBytes());
        if (sessionEntity.isEmpty()) {
            return false;
        }
        return sessionEntity.get().getRevoked();
    }

    @Override
    public UserSessionDto getSessionByRefreshToken(String refreshToken) {
        return userSessionMapper.toDto(userSessionsRepository.findByRefreshToken(refreshToken.getBytes())
                .orElseThrow(() -> new UserSessionNotFound("User session not found")));
    }

    @Override
    public UserSessionEntity updateUserSession(UserSessionDto session) {
        return userSessionsRepository.save(userSessionMapper.toEntity(session));
    }

    @Override
    public void updateUserSession(UserSessionEntity session) {
        userSessionsRepository.save(session);
    }

    @Override
    public UserSessionDto createNewSession(String userEmail) {
        OffsetDateTime timeNow = OffsetDateTime.now();
        UserCredentialsDto userCredentialsDto = userServiceImpl.getUserCredentialsByEmail(userEmail);

        UserSessionDto userSession = new UserSessionDto();
        userSession.setUserId(userCredentialsDto.getUserId());
        userSession.setRefreshToken(UUID.randomUUID().toString());
        userSession.setRefreshTokenExpiresAt(timeNow.plus(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod())));
        userSession.setAccessToken(jwtServiceImpl.generateToken(userEmail));
        userSession.setAccessTokenExpiresAt(timeNow.plus(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod())));
        userSession.setLastActiveAt(timeNow);
        userSession.setCreatedAt(timeNow);

        return userSessionMapper.toDto(updateUserSession(userSession));
    }

    @Override
    public UserAuthTokensDto refreshSession(String refreshToken) {
        UserSessionDto session = getSessionByRefreshToken(refreshToken);

        if (session.getRefreshTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UserIsNotAuthorized("User is not authorized");
        }

        UserCredentialsDto userCredentialsDto = userServiceImpl.getUserCredentialsById(session.getUserId());

        session.setRefreshToken(UUID.randomUUID().toString());
        session.setRefreshTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod())));
        session.setAccessToken(jwtServiceImpl.generateToken(userCredentialsDto.getEmail()));
        session.setAccessTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod())));
        session.setLastActiveAt(OffsetDateTime.now());

        updateUserSession(session);

        UserAuthTokensDto newAuthTokens = new UserAuthTokensDto();
        newAuthTokens.setRefreshToken(session.getRefreshToken());
        newAuthTokens.setRefreshTokenExpiresAt(session.getRefreshTokenExpiresAt());
        newAuthTokens.setAccessToken(session.getAccessToken());

        return newAuthTokens;
    }

    @Override
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

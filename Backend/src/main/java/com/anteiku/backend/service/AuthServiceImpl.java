package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.config.SecurityProperties;
import com.anteiku.backend.security.jwt.JwtServiceImpl;
import com.anteiku.backend.security.session.UserSessionsServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    final private PasswordEncoder passwordEncoder;
    final private UserRepository userRepository;
    final private UserCredentialsRepository userCredentialsRepository;
    final private JwtServiceImpl jwtServiceImpl;
    final private UserSessionsServiceImpl userSessionsService;
    final private SecurityProperties securityProperties;

    @Override
    public UserAuthResponseDto authenticateUser(UserAuthDto userAuthDto) {
        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByEmail(userAuthDto.getEmail());
        if (userCredentials.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(userAuthDto.getPassword(), userCredentials.get().getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        UserEntity userEntity = userRepository.findUserById(userCredentials.get().getUserId()).get();

        UserInfoDto userInfoDto = new UserInfoDto();
        userInfoDto.setId(userEntity.getId());
        userInfoDto.setUsername(userEntity.getUsername());
        userInfoDto.setEmail(userAuthDto.getEmail());
        userInfoDto.setRole(userEntity.getRole().toString());

        String token = jwtServiceImpl.generateToken(userInfoDto.getEmail());

        String refreshToken = UUID.randomUUID().toString();

        UserAuthTokensDto authTokensDto = new UserAuthTokensDto();
        authTokensDto.setAccessToken(token);
        authTokensDto.setRefreshToken(refreshToken);

        UserAuthResponseDto userAuthResponseDto = new UserAuthResponseDto();
        userAuthResponseDto.setUserInfo(userInfoDto);
        userAuthResponseDto.setAuthTokens(authTokensDto);

        UserSessionEntity userSessionEntity = new UserSessionEntity();
        userSessionEntity.setUserId(userEntity.getId());
        userSessionEntity.setRefreshToken(refreshToken.getBytes());
        userSessionEntity.setRefreshTokenExpiresAt(Instant.now().plus(securityProperties.getRefreshTokenExpirationPeriod(), ChronoUnit.DAYS));
        userSessionEntity.setAccessToken(authTokensDto.getAccessToken().getBytes());
        userSessionEntity.setAccessTokenExpiresAt(Instant.now().plus(securityProperties.getAccessTokenExpirationPeriod(), ChronoUnit.DAYS));

        userSessionsService.updateUserSession(userSessionEntity);

        return userAuthResponseDto;
    }

    @Override
    public UserAuthTokensDto refreshAuthTokens(String refreshToken) {
        UserSessionDto session = userSessionsService.getSessionByRefreshToken(refreshToken);

        if (session.getRefreshTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UserIsNotAuthorized("User is not authorized");
        }

        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByUserId(session.getUserId());
        if (userCredentials.isEmpty()) {
            throw new UserNotFoundException("User's credentials are not found");
        }


        session.setRefreshToken(UUID.randomUUID().toString());
        session.setRefreshTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod())));
        session.setAccessToken(jwtServiceImpl.generateToken(userCredentials.get().getEmail()));
        session.setAccessTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod())));
        session.setLastActiveAt(OffsetDateTime.now());

        userSessionsService.updateUserSession(session);

        UserAuthTokensDto newAuthTokens = new UserAuthTokensDto();
        newAuthTokens.setRefreshToken(session.getRefreshToken());
        newAuthTokens.setRefreshTokenExpiresAt(session.getRefreshTokenExpiresAt());
        newAuthTokens.setAccessToken(session.getAccessToken());

        return newAuthTokens;
    }
}

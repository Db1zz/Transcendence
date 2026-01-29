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
import com.anteiku.backend.security.jwt.JwtServiceImpl;
import com.anteiku.backend.security.session.UserSessionsServiceImpl;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
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

    @Value("${app.security.refresh_token_expiration_period}")
    private long refreshTokenExpiresIn;

    @Value("${app.security.access_token_expiration_period}")
    private long accessTokenExpiresIn;

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
        userSessionEntity.setRefreshTokenExpiresAt(Instant.now().plus(refreshTokenExpiresIn, ChronoUnit.DAYS));
        userSessionEntity.setAccessToken(authTokensDto.getAccessToken().getBytes());
        userSessionEntity.setAccessTokenExpiresAt(Instant.now().plus(accessTokenExpiresIn, ChronoUnit.DAYS));

        userSessionsService.updateUserSession(userSessionEntity);

        return userAuthResponseDto;
    }

    public UserAuthTokensDto refreshAuthTokens(String refreshToken) {
        UserSessionDto session = userSessionsService.getSessionByRefreshToken(refreshToken);

        if (session.getRefreshTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UserIsNotAuthorized("User is not authorized");
        }

        UserAuthTokensDto newAuthTokens = new UserAuthTokensDto();

        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByUserId(session.getUserId());
        if (userCredentials.isEmpty()) {
            throw new UserNotFoundException("User's credentials are not found");
        }

        newAuthTokens.setRefreshToken(UUID.randomUUID().toString());
        newAuthTokens.setRefreshTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(refreshTokenExpiresIn)));
        newAuthTokens.setAccessToken(jwtServiceImpl.generateToken(userCredentials.get().getEmail()));

        session.setCreatedAt(newAuthTokens.getRefreshTokenExpiresAt());
        session.setRefreshToken(newAuthTokens.getRefreshToken());
        session.setAccessTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(accessTokenExpiresIn)));

        userSessionsService.updateUserSession(session);

        return newAuthTokens;
    }
}

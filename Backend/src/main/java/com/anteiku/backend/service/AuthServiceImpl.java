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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.Charset;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
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

        UserAuthResponseDto userAuthResponseDto = new UserAuthResponseDto();
        userAuthResponseDto.setUserInfo(userInfoDto);
        userAuthResponseDto.getAuthTokens().setAccessToken(token);

        return userAuthResponseDto;
    }

    public UserAuthTokensDto refreshAuthTokens(String refreshToken) {
        UserSessionDto session = userSessionsService.getSessionByRefreshToken(refreshToken);

        if (session.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UserIsNotAuthorized("User is not authorized");
        }

        UserAuthTokensDto newAuthTokens = new UserAuthTokensDto();

        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByUserId(session.getUserId());
        if (userCredentials.isEmpty()) {
            throw new UserNotFoundException("User's credentials are not found");
        }

        newAuthTokens.setRefreshToken(UUID.randomUUID().toString());
        newAuthTokens.setRefreshTokenExpiresAt(OffsetDateTime.now().plus(Duration.ofDays(31)));
        newAuthTokens.setAccessToken(jwtServiceImpl.generateToken(userCredentials.get().getEmail()));

        session.setCreatedAt(newAuthTokens.getRefreshTokenExpiresAt());
        session.setRefreshToken(newAuthTokens.getRefreshToken());

        userSessionsService.updateUserSession(session);

        return newAuthTokens;
    }
}

package com.anteiku.backend.security.session;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.exception.InvalidToken;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.exception.UserSessionNotFound;
import com.anteiku.backend.mapper.UserSessionMapper;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.repository.UserSessionsRepository;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserSessionsServiceImpl implements UserSessionsService {
    final private UserSessionsRepository userSessionsRepository;
    final private UserSessionMapper userSessionMapper;

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
    public void updateUserSession(UserSessionDto session) {
        userSessionsRepository.save(userSessionMapper.toEntity(session));
    }

    @Override
    public void updateUserSession(UserSessionEntity session) {
        userSessionsRepository.save(session);
    }
}

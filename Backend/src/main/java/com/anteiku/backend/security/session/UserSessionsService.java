package com.anteiku.backend.security.session;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserSessionDto;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.Cookie;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionsService {
    void logout(String token);
    boolean isSessionLoggedOut(String token);
    UserSessionDto getSessionByRefreshToken(String refreshToken);
    UserSessionEntity updateUserSession(UserSessionDto session);
    void updateUserSession(UserSessionEntity session);
    UserSessionDto createNewSession(String userEmail);
    UserAuthTokensDto refreshSession(String refreshToken);
    UserAuthTokensDto getUserSessionAuthTokens(UUID sessionId);
}

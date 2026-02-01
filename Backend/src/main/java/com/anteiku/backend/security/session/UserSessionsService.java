package com.anteiku.backend.security.session;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserSessionDto;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.Cookie;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionsService {
    void logout(String token);
    boolean isSessionLoggedOut(String token);
    UserSessionDto getSessionByRefreshToken(String refreshToken);
    void updateUserSession(UserSessionDto session);
    void updateUserSession(UserSessionEntity session);
}

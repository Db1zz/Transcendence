package com.anteiku.backend.security.session;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserSessionDto;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionsService {
    void logout(String token);
    boolean isSessionLoggedOut(String token);
    UserSessionDto getSessionByRefreshToken(String refreshToken);
    UserSessionDto getSessionByAccessToken(String accessToken);
    void updateUserSession(UserSessionDto session);
    void updateUserSession(UserSessionEntity session);
}

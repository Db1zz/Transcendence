package com.anteiku.backend.security.session;

public interface SessionService {
    void logout(String token);
    boolean isSessionLoggedOut(String token);
}

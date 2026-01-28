package com.anteiku.backend.security.session;

import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class SessionServiceImpl implements SessionService {
    final private HashSet<String> loggedOutSession = new HashSet<String>();

    @Override
    public void logout(String token) {
        if (token == null) {
            return;
        }

        if (loggedOutSession.contains(token)) {
            return;
        }
        loggedOutSession.add(token);
    }

    @Override
    public boolean isSessionLoggedOut(String token) {
        return  loggedOutSession.contains(token);
    }
}

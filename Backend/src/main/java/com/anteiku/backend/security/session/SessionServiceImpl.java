package com.anteiku.backend.security.session;

import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class SessionServiceImpl implements SessionService {
    final private HashSet<String> usedTokens = new HashSet<String>();

    @Override
    public void logout(String token) {
        if (token == null) {
            return;
        }

        if (usedTokens.contains(token)) {
            return;
        }
        usedTokens.add(token);
    }

    @Override
    public boolean isSessionLogouted(String token) {
        return  usedTokens.contains(token);
    }
}

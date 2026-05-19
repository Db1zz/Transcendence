package com.anteiku.backend.stomp.service;

import com.anteiku.backend.exception.UserSessionNotFound;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.UUID;

@Service
public class StompSessionService {
    // sessionId/userId
    HashMap<String, UUID> sessions = new HashMap<>();

    public void addSession(String sessionId, UUID userId) {
        sessions.put(sessionId, userId);
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    public boolean hasSession(String sessionId) {
        return sessions.containsKey(sessionId);
    }

    public UUID getUserId(String sessionId) {
        if (!hasSession(sessionId)) {
            throw new UserSessionNotFound("Stomp session with id " + sessionId + " not found");
        }
        return sessions.get(sessionId);
    }

}

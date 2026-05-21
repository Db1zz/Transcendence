package com.anteiku.backend.stomp.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.messaging.AbstractSubProtocolEvent;

import java.security.Principal;
import java.util.UUID;

@Slf4j
public class ExtractSessionIdAndUserIdFromEvent {
    public static Pair<String, UUID> extract(AbstractSubProtocolEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String destination = accessor.getDestination();

        Principal user = accessor.getUser();
        if (!(user instanceof UsernamePasswordAuthenticationToken authToken)) {
            log.warn("STOMP subscribe ignored: user is missing or invalid for destination {}", destination);
            return null;
        }

        Object principal = authToken.getPrincipal();
        if (!(principal instanceof UUID userId)) {
            log.warn("STOMP subscribe ignored: principal is not UUID for destination {}", destination);
            return null;
        }

        return Pair.of(accessor.getSessionId(), userId);
    }
}

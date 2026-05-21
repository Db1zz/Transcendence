package com.anteiku.backend.stomp.listener;

import com.anteiku.backend.stomp.facade.UserStatusSubscriptionFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompUserStatusEventListener {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private final UserStatusSubscriptionFacade userStatusSubscriptionFacade;

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        if (destination == null || !PATH_MATCHER.match("/topic/statuses/*", destination)) {
            return;
        }

        Principal user = accessor.getUser();
        if (!(user instanceof UsernamePasswordAuthenticationToken authToken)) {
            log.warn("STOMP subscribe ignored: user is missing or invalid for destination {}", destination);
            return;
        }

        Object principal = authToken.getPrincipal();
        if (!(principal instanceof UUID userId)) {
            log.warn("STOMP subscribe ignored: principal is not UUID for destination {}", destination);
            return;
        }

        log.info("User fully subscribed to statuses topic: userId={}, destination={}", userId, destination);

        userStatusSubscriptionFacade.handleSubscribe(userId);
    }
}
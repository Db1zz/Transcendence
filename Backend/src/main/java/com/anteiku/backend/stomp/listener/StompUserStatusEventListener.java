package com.anteiku.backend.stomp.listener;

import com.anteiku.backend.stomp.facade.UserStatusSubscriptionFacade;
import com.anteiku.backend.stomp.util.ExtractSessionIdAndUserIdFromEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.util.Pair;
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

        Pair<String, UUID> ids = ExtractSessionIdAndUserIdFromEvent.extract(event);

        log.info("User fully subscribed to statuses topic: userId={}, destination={}", ids.getSecond(), destination);
        userStatusSubscriptionFacade.handleSubscribe(ids.getSecond());
    }
}
package com.anteiku.backend.stomp.listener;

import com.anteiku.backend.stomp.service.StompDisconnectService;
import com.anteiku.backend.stomp.service.StompSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompGlobalEventListener {
    StompDisconnectService stompDisconnectService;
    StompSessionService stompSessionService;

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        UUID userId = stompSessionService.removeSession(sessionId);

        stompDisconnectService.handle(userId);
    }
}

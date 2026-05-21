package com.anteiku.backend.stomp.gateway;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatusNotificationGateway {
    private final SimpMessagingTemplate messagingTemplate;

    public void send(UUID userId, String status) {
        messagingTemplate.convertAndSend("/topic/statuses/" + userId, status);
    }
}

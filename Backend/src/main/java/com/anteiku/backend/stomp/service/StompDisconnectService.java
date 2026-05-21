package com.anteiku.backend.stomp.service;

import com.anteiku.backend.stomp.handler.ClientDisconnectHandler;
import com.anteiku.backend.stomp.handler.OrganizationDisconnectEventHandler;
import com.anteiku.backend.stomp.handler.StatusDisconnectEventHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StompDisconnectService {
    private List<ClientDisconnectHandler> disconnectHandlers = new ArrayList<>();
    private final OrganizationDisconnectEventHandler organizationDisconnectEventHandler;
    private final StatusDisconnectEventHandler statusDisconnectEventHandler;

    public void handle(UUID userId) {
        for (ClientDisconnectHandler handler : disconnectHandlers) {
            handler.handle(userId);
        }
    }

    @PostConstruct
    private void init() {
        disconnectHandlers.addAll(List.of(
                statusDisconnectEventHandler,
                organizationDisconnectEventHandler
        ));
    }
}

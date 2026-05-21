package com.anteiku.backend.stomp.handler;

import java.util.UUID;

public interface ClientDisconnectHandler {
    void handle(UUID userId);
}

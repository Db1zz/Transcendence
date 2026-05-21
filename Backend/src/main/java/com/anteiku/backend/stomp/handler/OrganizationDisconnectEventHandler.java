package com.anteiku.backend.stomp.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationDisconnectEventHandler implements ClientDisconnectHandler {
    @Override
    public void handle(UUID userId) {

    }
}

package com.anteiku.backend.stomp.handler;

import com.anteiku.backend.stomp.gateway.StatusNotificationGateway;
import com.anteiku.backend.stomp.service.UserStatusRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatusDisconnectEventHandler implements ClientDisconnectHandler {
    private final UserStatusRegistryService userStatusService;
    private final StatusNotificationGateway statusNotificationGateway;

    @Override
    public void handle(UUID userId) {
        List<UUID> onlineFriends = userStatusService.getMyOnlineSubs(userId);
        userStatusService.unsubscribe(userId);

        if (onlineFriends == null || onlineFriends.isEmpty()) {
            return;
        }

        for (UUID friendId : onlineFriends) {
            statusNotificationGateway.send(
                    friendId,
                    String.format("{\"userId\":\"%s\", \"status\":\"offline\"}", userId)
            );
        }
    }
}

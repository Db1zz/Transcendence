package com.anteiku.backend.stomp.listener;

import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.service.UserStatusService;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.stomp.service.StompSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final StompSessionService stompSessionService;
    private final UserStatusService userStatusService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FriendsService friendsService;

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        if (destination != null && destination.startsWith("/topic/statuses/")) {
            if (event.getUser() != null) {
                UUID userId = UUID.fromString(event.getUser().getName());

                Set<UUID> userFriends = fetchKnownUsersFromDb(userId);
                handleSubscribe(userId, userFriends);
            }
        }
    }

    @EventListener
    public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        UUID userId = stompSessionService.getUserId(accessor.getSessionId());
        handleDisconnect(userId);
        stompSessionService.removeSession(accessor.getSessionId());
        log.info("User {} disconnected", userId);
    }

    private void handleSubscribe(UUID userId, Set<UUID> friends) {
        userStatusService.subscribe(userId, friends);
        List<UUID> onlineFriends = userStatusService.getMyOnlineSubs(userId);

        for (UUID friendId : onlineFriends) {
            messagingTemplate.convertAndSend(
                    "/topic/statuses/" + userId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", friendId)
            );

            messagingTemplate.convertAndSend(
                    "/topic/statuses/" + friendId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", userId)
            );
        }
    }

    private void handleDisconnect(UUID userId) {
        List<UUID> onlineFriends = userStatusService.getMyOnlineSubs(userId);
        userStatusService.unsubscribe(userId);

        for (UUID friendId : onlineFriends) {
            messagingTemplate.convertAndSend(
                    "/topic/statuses/" + friendId,
                    String.format("{\"userId\":\"%s\", \"status\":\"offline\"}", userId)
            );
        }
    }

    private Set<UUID> fetchKnownUsersFromDb(UUID userId) {
        List<FriendDto> myFriends = friendsService.getMyFriends(userId);
        return myFriends.stream()
                .map(FriendDto::getId)
                .collect(Collectors.toSet());
    }
}
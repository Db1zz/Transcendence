package com.anteiku.backend.stomp.facade;

import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.stomp.gateway.StatusNotificationGateway;
import com.anteiku.backend.stomp.service.UserStatusRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserStatusSubscriptionFacade {
    private final StatusNotificationGateway statusNotificationGateway;
    private final UserStatusRegistryService userStatusRegistryService;
    private final FriendsService friendsService;

    public void handleSubscribe(UUID userId) {
        Set<UUID> friends = fetchKnownUsersFromDb(userId);
        userStatusRegistryService.subscribe(userId, friends);
        List<UUID> onlineFriends = userStatusRegistryService.getMyOnlineSubs(userId);

        for (UUID friendId : onlineFriends) {
            log.info("Friend with Id: {} is online!", friendId);
            statusNotificationGateway.send(
                    userId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", friendId)
            );

            statusNotificationGateway.send(
                    friendId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", userId)
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

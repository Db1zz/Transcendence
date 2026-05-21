package com.anteiku.backend.stomp.facade;

import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.OrganizationDto;
import com.anteiku.backend.model.ServerMemberDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.service.OrganizationMemberService;
import com.anteiku.backend.service.OrganizationService;
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
    private final OrganizationService organizationService;
    private final OrganizationMemberService organizationMemberService;

    public void handleSubscribe(UUID userId) {
        Set<UUID> users = fetchKnownUsersFromDb(userId);
        userStatusRegistryService.subscribe(userId, users);
        List<UUID> subscriberIds = userStatusRegistryService.getMyOnlineSubs(userId);

        for (UUID subscriberId : subscriberIds) {
            statusNotificationGateway.send(
                    userId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", subscriberId)
            );

            statusNotificationGateway.send(
                    subscriberId,
                    String.format("{\"userId\":\"%s\", \"status\":\"online\"}", userId)
            );
        }
    }

    private Set<UUID> fetchKnownUsersFromDb(UUID userId) {
        Set<UUID> ids = friendsService.getMyFriends(userId).stream()
                .map(FriendDto::getId)
                .collect(Collectors.toSet());

        organizationService.getUserOrganizations(userId).stream()
                .flatMap(org -> organizationMemberService.getOrganizationMembers(userId, org.getId()).stream())
                .map(ServerMemberDto::getUser)
                .map(UserPublicDto::getId)
                .forEach(ids::add);

        return ids;
    }
}

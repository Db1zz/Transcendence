package com.anteiku.backend.stomp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class UserStatusRegistryService {
    // userId/userIds
    private final HashMap<UUID, Set<UUID>> subscribedUsers = new HashMap<>();
    public void subscribe(UUID userId, Set<UUID> knownUserIds) {
        subscribedUsers.put(userId, knownUserIds);
    }

    public void unsubscribe(UUID userId) {
        subscribedUsers.remove(userId);
        log.info("User {} unsubscribed from receiving any statuses.", userId);
    }

    public boolean isOnline(UUID userId) {
        return subscribedUsers.containsKey(userId);
    }

    public List<UUID> getMyOnlineSubs(UUID userId) {
        Set<UUID> subscriptions = subscribedUsers.get(userId);

        if (subscriptions == null || subscriptions.isEmpty()) {
            return null;
        }

        List<UUID> result = new ArrayList<UUID>();
        for (UUID sub : subscriptions) {
            if (isOnline(sub)) {
                result.add(sub);
            }
        }
        return result;
    }
}
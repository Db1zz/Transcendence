package com.anteiku.backend.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserStatusService {
    private final HashMap<UUID, Set<UUID>> subscribedUsers = new HashMap<>();

    public void subscribe(UUID userId, Set<UUID> friendIds) {
        subscribedUsers.put(userId, friendIds);
    }

    public void unsubscribe(UUID userId) {
        subscribedUsers.remove(userId);
    }

    public boolean isOnline(UUID userId) {
        return subscribedUsers.containsKey(userId);
    }

    public List<UUID> getMyOnlineSubs(UUID userId) {
        Set<UUID> subscriptions = subscribedUsers.get(userId);
        List<UUID> result = new ArrayList<UUID>();
        for (UUID sub : subscriptions) {
            if (isOnline(sub)) {
                result.add(sub);
            }
        }
        return result;
    }
}
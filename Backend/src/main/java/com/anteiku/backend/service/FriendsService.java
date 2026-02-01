package com.anteiku.backend.service;

import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FriendsService {
    void sendFriendRequest(UUID requesterId, UUID addresseeId);
    void acceptFriendRequest(UUID meId, UUID requesterId);
    void removeFriend(UUID meId, UUID requesterId);
    List<FriendDto> getMyFriends(UUID requesterId);
    List<FriendDto> getMyPendingRequests(UUID requesterId);
}

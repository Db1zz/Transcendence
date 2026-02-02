package com.anteiku.backend.service;

import com.anteiku.backend.model.FriendDto;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FriendsService {
    void sendFriendRequest(UUID requesterId, UUID addresseeId);
    void acceptFriendRequest(UUID meId, UUID requesterId);
    void removeFriend(UUID meId, UUID requesterId);
    List<FriendDto> getMyFriends(UUID meId);
    List<FriendDto> getMyPendingRequests(UUID meId);
}

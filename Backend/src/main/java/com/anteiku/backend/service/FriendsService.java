package com.anteiku.backend.service;

import com.anteiku.backend.model.FriendDto;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FriendsService {
    void sendFriendRequest(UUID requesterId, UUID addresseeId);
    void acceptFriendRequest(UUID meId, UUID requesterId);
    void removeFriend(UUID meId, UUID requesterId);
    void blockUser(UUID requesterId, UUID addressId);
    void unblockUser(UUID requesterId, UUID addressId);
    List<FriendDto> getMyFriends(UUID meId);
    List<FriendDto> getMyPendingRequests(UUID meId);
    List<FriendDto> getMyBlockedUsers(UUID meId);
}

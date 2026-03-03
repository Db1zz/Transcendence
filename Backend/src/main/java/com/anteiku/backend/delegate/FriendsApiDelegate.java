package com.anteiku.backend.delegate;

import com.anteiku.backend.api.FriendsApi;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.service.UserService;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FriendsApiDelegate implements FriendsApi {
    private final FriendsService friendsService;
    private final UserService userService;

    @Override
    public ResponseEntity<List<FriendDto>> getMyFriends() {
        return ResponseEntity.ok(friendsService.getMyFriends(SecurityUtils.getCurrentUserId()));
    }

    @Override
    public ResponseEntity<Void> addFriend(UUID userId) {
        friendsService.sendFriendRequest(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> acceptFriend(UUID userId) {
        friendsService.acceptFriendRequest(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> removeFriend(UUID userId) {
        friendsService.removeFriend(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<FriendDto>> getMyBlockedUsers() {
        return ResponseEntity.ok(friendsService.getMyBlockedUsers(SecurityUtils.getCurrentUserId()));
    }

    @Override
    public ResponseEntity<Void> blockUser(UUID userId) {
        friendsService.blockUser(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> unblockUser(UUID userId) {
        friendsService.unblockUser(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<FriendDto>> getMyRequests() {
        return ResponseEntity.ok(friendsService.getMyPendingRequests(SecurityUtils.getCurrentUserId()));
    }
}

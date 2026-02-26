package com.anteiku.backend.delegate;

import com.anteiku.backend.api.FriendsApi;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.security.jwt.JwtUtils;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
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
    private final JwtUtils jwtUtils;

    private UUID getCurrentUserId() {
        String email = jwtUtils.getCurrentUserEmail()
                .orElseThrow(() -> new UserIsNotAuthorized("User is not authorized"));
        UserPublicDto user = userService.getUserByEmail(email);
        return user.getId();
    }

    @Override
    public ResponseEntity<List<FriendDto>> getMyFriends() {
        return ResponseEntity.ok(friendsService.getMyFriends(getCurrentUserId()));
    }

    @Override
    public ResponseEntity<Void> addFriend(UUID userId) {
        friendsService.sendFriendRequest(getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> acceptFriend(UUID userId) {
        friendsService.acceptFriendRequest(getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> removeFriend(UUID userId) {
        friendsService.removeFriend(getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<FriendDto>> getMyBlockedUsers() {
        return ResponseEntity.ok(friendsService.getMyBlockedUsers(getCurrentUserId()));
    }

    @Override
    public ResponseEntity<Void> blockUser(UUID userId) {
        friendsService.blockUser(getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> unblockUser(UUID userId) {
        friendsService.unblockUser(getCurrentUserId(), userId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<FriendDto>> getMyRequests() {
        return ResponseEntity.ok(friendsService.getMyPendingRequests(getCurrentUserId()));
    }
}

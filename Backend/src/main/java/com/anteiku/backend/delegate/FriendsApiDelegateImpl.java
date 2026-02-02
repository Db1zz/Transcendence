package com.anteiku.backend.delegate;

import com.anteiku.backend.api.FriendsApi;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.security.jwt.JwtUtils;
import com.anteiku.backend.service.FriendsService;
import com.anteiku.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FriendsApiDelegateImpl implements FriendsApi {
    private final FriendsService friendsService;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    private UUID getCurrentUserId() {
        String email = jwtUtils.getCurrentUserEmail()
                .orElseThrow(() -> new RuntimeException("Not authenticated"));
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
}

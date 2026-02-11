package com.anteiku.backend.service;

import com.anteiku.backend.entity.FriendsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.FriendStatus;
import com.anteiku.backend.model.UserStatus;
import com.anteiku.backend.repository.FriendsRepository;
import com.anteiku.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FriendsService {
    private final FriendsRepository friendsRepository;
    private final UserRepository userRepository;

    public void sendFriendRequest(UUID requesterId, UUID addresseeId) {
        System.out.println("FIND BY id requesterId: " + userRepository.findById(requesterId) + "\nFIND BY ID addresseeId: " + userRepository.findById(addresseeId));
        if (requesterId.equals(addresseeId)) {
            throw new IllegalArgumentException("requesterId and addresseeId can't be the same");
        }
        UserEntity requester = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity addressee = userRepository.findById(addresseeId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (friendsRepository.existsByRequesterAndAddressee(requester, addressee) ||
            friendsRepository.existsByRequesterAndAddressee(addressee, requester)) {
            throw new IllegalArgumentException("Friend request already sent or users are already friends");
        }

        FriendsEntity friendsEntity = FriendsEntity.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendStatus.PENDING)
                .build();

        friendsRepository.save(friendsEntity);
    }

    public void acceptFriendRequest(UUID meId, UUID requesterId) {
        UserEntity me = userRepository.findById(meId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity requester = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendsEntity request = friendsRepository.findByRequesterAndAddressee(requester, me)
                .orElseThrow(() -> new IllegalArgumentException("No pending friend request found"));
        request.setStatus(FriendStatus.FRIEND);
        friendsRepository.save(request);
    }

    public void removeFriend(UUID meId, UUID requesterId) {
        UserEntity me = userRepository.findById(meId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity requester = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendsEntity friend = friendsRepository.findByRequesterAndAddressee(me, requester)
                .orElseGet(() -> friendsRepository.findByRequesterAndAddressee(requester, me)
                        .orElseThrow(() -> new IllegalArgumentException("No pending friend request found")));
        friendsRepository.delete(friend);
    }

    public void blockUser(UUID requesterId, UUID addresseeId) {
        UserEntity requester = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity addressee = userRepository.findById(addresseeId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendsEntity friend = friendsRepository.findByRequesterAndAddressee(requester, addressee)
                .orElseGet(() -> friendsRepository.findByRequesterAndAddressee(addressee, requester)
                .orElse(null));

        if  (friend != null) {
            friend.setRequester(requester);
            friend.setAddressee(addressee);
            friend.setStatus(FriendStatus.BLOCKED);
            friendsRepository.save(friend);
        } else {
            FriendsEntity block = FriendsEntity.builder()
                    .requester(requester)
                    .addressee(addressee)
                    .status(FriendStatus.BLOCKED)
                    .build();
            friendsRepository.save(block);
        }
    }

    public void unblockUser(UUID requesterId, UUID addresseeId) {
        UserEntity requester = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity addressee = userRepository.findById(addresseeId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendsEntity block = friendsRepository.findByRequesterAndAddressee(requester, addressee)
                .orElseThrow(() -> new IllegalArgumentException("Blocked user was not found"));

        if (!block.getStatus().equals(FriendStatus.BLOCKED)) {
            throw new IllegalStateException("Blocked user is not blocked");
        }

        friendsRepository.delete(block);
    }

    public List<FriendDto> getMyFriends(UUID meId) {
        List<FriendsEntity> friends = friendsRepository.findAllAcceptedFriends(meId);

        return friends.stream()
                .map(f -> {
                    UserEntity friend = f.getRequester().getId().equals(meId) ? f.getAddressee() : f.getRequester();
                    return mapToFriendDto(friend, FriendStatus.FRIEND);
                })
                .collect(Collectors.toList());
    }

    public List<FriendDto> getMyPendingRequests(UUID meId) {
        return friendsRepository.findPendingFriendsForMe(meId).stream()
                .map(f -> mapToFriendDto(f.getRequester(), FriendStatus.PENDING))
                .collect(Collectors.toList());
    }

    public List<FriendDto> getMyBlockedUsers(UUID meId) {
        return friendsRepository.findBlockedByMe(meId).stream()
                .map(f -> mapToFriendDto(f.getAddressee(), FriendStatus.BLOCKED))
                .collect(Collectors.toList());
    }

    private FriendDto mapToFriendDto(UserEntity friend, FriendStatus friendStatus) {
        FriendDto friendDto = new FriendDto();
        friendDto.setId(friend.getId());
        friendDto.setUsername(friend.getUsername());
        friendDto.setDisplayName(friend.getDisplayName());
        UserStatus userStatus = friend.getStatus() != null ? friend.getStatus() : UserStatus.OFFLINE;
        friendDto.setStatus(FriendDto.StatusEnum.fromValue(userStatus.name()));
        friendDto.setFriendStatus(FriendDto.FriendStatusEnum.fromValue(friendStatus.name()));
        return friendDto;
    }
}

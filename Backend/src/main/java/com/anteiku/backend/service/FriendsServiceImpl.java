package com.anteiku.backend.service;

import com.anteiku.backend.entity.FriendsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.FriendStatus;
import com.anteiku.backend.repository.FriendsRepository;
import com.anteiku.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class FriendsServiceImpl implements FriendsService {
    private final FriendsRepository friendsRepository;
    private final UserRepository userRepository;

    @Override
    public void sendFriendRequest(UUID requesterId, UUID addresseeId) {
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

    @Override
    public void acceptFriendRequest(UUID meId, UUID requesterId) {
        UserEntity me = userRepository.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserEntity requester = userRepository.findById(meId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        FriendsEntity request = friendsRepository.findByRequesterAndAddressee(requester, me)
                .orElseThrow(() -> new IllegalArgumentException("No pending friend request found"));
        request.setStatus(FriendStatus.FRIEND);
        friendsRepository.save(request);
    }

    @Override
    public void removeFriend(UUID meId, UUID requesterId) {
        
    }

    @Override
    public List<FriendDto> getMyFriends(UUID requesterId) {

    }

    @Override
    public List<FriendDto> getMyPendingRequests(UUID requesterId) {

    }
}

package com.anteiku.backend.service;

import com.anteiku.backend.entity.FriendsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.FriendStatus;
import com.anteiku.backend.model.UserStatus;
import com.anteiku.backend.repository.FriendsRepository;
import com.anteiku.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FriendsServiceTest {

    @Mock private FriendsRepository friendsRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private FriendsService friendsService;

    @Test
    void sendFriendRequest_throws_whenSameIds() {
        UUID id = UUID.randomUUID();

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendsService.sendFriendRequest(id, id))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("requesterId and addresseeId can't be the same");

        verifyNoInteractions(friendsRepository);
    }

    @Test
    void sendFriendRequest_throws_whenRequesterNotFound() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        when(userRepository.findById(requesterId)).thenReturn(Optional.empty());
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(user(addresseeId, "addressee", null, UserStatus.ONLINE)));

        assertThatThrownBy(() -> friendsService.sendFriendRequest(requesterId, addresseeId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");

        verifyNoInteractions(friendsRepository);
    }

    @Test
    void sendFriendRequest_throws_whenAddresseeNotFound() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(user(requesterId, "requester", null, UserStatus.ONLINE)));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendsService.sendFriendRequest(requesterId, addresseeId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");

        verifyNoInteractions(friendsRepository);
    }

    @Test
    void sendFriendRequest_throws_whenRequestAlreadyExists_direct() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "requester", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "addressee", null, UserStatus.ONLINE);

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));

        when(friendsRepository.existsByRequesterAndAddressee(requester, addressee)).thenReturn(true);

        assertThatThrownBy(() -> friendsService.sendFriendRequest(requesterId, addresseeId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Friend request already sent or users are already friends");

        verify(friendsRepository, never()).save(any());
    }

    @Test
    void sendFriendRequest_throws_whenRequestAlreadyExists_reverse() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "requester", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "addressee", null, UserStatus.ONLINE);

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));

        when(friendsRepository.existsByRequesterAndAddressee(requester, addressee)).thenReturn(false);
        when(friendsRepository.existsByRequesterAndAddressee(addressee, requester)).thenReturn(true);

        assertThatThrownBy(() -> friendsService.sendFriendRequest(requesterId, addresseeId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Friend request already sent or users are already friends");

        verify(friendsRepository, never()).save(any());
    }

    @Test
    void sendFriendRequest_savesPendingRequest_whenOk() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "requester", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "addressee", null, UserStatus.ONLINE);

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));

        when(friendsRepository.existsByRequesterAndAddressee(requester, addressee)).thenReturn(false);
        when(friendsRepository.existsByRequesterAndAddressee(addressee, requester)).thenReturn(false);

        friendsService.sendFriendRequest(requesterId, addresseeId);

        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository).save(captor.capture());

        FriendsEntity saved = captor.getValue();
        assertThat(saved.getRequester()).isSameAs(requester);
        assertThat(saved.getAddressee()).isSameAs(addressee);
        assertThat(saved.getStatus()).isEqualTo(FriendStatus.PENDING);
    }

    @Test
    void acceptFriendRequest_setsStatusFriend_andSaves() {
        UUID meId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);

        FriendsEntity pending = FriendsEntity.builder()
                .requester(requester)
                .addressee(me)
                .status(FriendStatus.PENDING)
                .build();

        when(userRepository.findById(meId)).thenReturn(Optional.of(me));
        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(friendsRepository.findByRequesterAndAddressee(requester, me)).thenReturn(Optional.of(pending));

        friendsService.acceptFriendRequest(meId, requesterId);

        assertThat(pending.getStatus()).isEqualTo(FriendStatus.FRIEND);
        verify(friendsRepository).save(pending);
    }

    @Test
    void acceptFriendRequest_throws_whenNoRequest() {
        UUID meId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);

        when(userRepository.findById(meId)).thenReturn(Optional.of(me));
        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(friendsRepository.findByRequesterAndAddressee(requester, me)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendsService.acceptFriendRequest(meId, requesterId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("No pending friend request found");

        verify(friendsRepository, never()).save(any());
    }

    @Test
    void removeFriend_deletes_whenDirectExists() {
        UUID meId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity other = user(otherId, "other", null, UserStatus.ONLINE);

        FriendsEntity relation = FriendsEntity.builder()
                .requester(me)
                .addressee(other)
                .status(FriendStatus.FRIEND)
                .build();

        when(userRepository.findById(meId)).thenReturn(Optional.of(me));
        when(userRepository.findById(otherId)).thenReturn(Optional.of(other));
        when(friendsRepository.findByRequesterAndAddressee(me, other)).thenReturn(Optional.of(relation));

        friendsService.removeFriend(meId, otherId);

        verify(friendsRepository).delete(relation);
        verify(friendsRepository, never()).findByRequesterAndAddressee(other, me);
    }

    @Test
    void removeFriend_deletes_whenReverseExists() {
        UUID meId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity other = user(otherId, "other", null, UserStatus.ONLINE);

        FriendsEntity relation = FriendsEntity.builder()
                .requester(other)
                .addressee(me)
                .status(FriendStatus.FRIEND)
                .build();

        when(userRepository.findById(meId)).thenReturn(Optional.of(me));
        when(userRepository.findById(otherId)).thenReturn(Optional.of(other));
        when(friendsRepository.findByRequesterAndAddressee(me, other)).thenReturn(Optional.empty());
        when(friendsRepository.findByRequesterAndAddressee(other, me)).thenReturn(Optional.of(relation));

        friendsService.removeFriend(meId, otherId);

        verify(friendsRepository).delete(relation);
    }

    @Test
    void removeFriend_throws_whenNoRelation() {
        UUID meId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity other = user(otherId, "other", null, UserStatus.ONLINE);

        when(userRepository.findById(meId)).thenReturn(Optional.of(me));
        when(userRepository.findById(otherId)).thenReturn(Optional.of(other));
        when(friendsRepository.findByRequesterAndAddressee(me, other)).thenReturn(Optional.empty());
        when(friendsRepository.findByRequesterAndAddressee(other, me)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendsService.removeFriend(meId, otherId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("No pending friend request found");

        verify(friendsRepository, never()).delete(any());
    }

    @Test
    void blockUser_updatesExistingRelation_whenFoundDirect() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        FriendsEntity existing = FriendsEntity.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendStatus.FRIEND)
                .build();

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));
        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.of(existing));

        friendsService.blockUser(requesterId, addresseeId);

        assertThat(existing.getRequester()).isSameAs(requester);
        assertThat(existing.getAddressee()).isSameAs(addressee);
        assertThat(existing.getStatus()).isEqualTo(FriendStatus.BLOCKED);

        verify(friendsRepository).save(existing);
    }

    @Test
    void blockUser_updatesExistingRelation_whenFoundReverse() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        FriendsEntity existingReverse = FriendsEntity.builder()
                .requester(addressee)
                .addressee(requester)
                .status(FriendStatus.PENDING)
                .build();

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));

        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.empty());
        when(friendsRepository.findByRequesterAndAddressee(addressee, requester)).thenReturn(Optional.of(existingReverse));

        friendsService.blockUser(requesterId, addresseeId);

        // must be overridden to (requester -> addressee)
        assertThat(existingReverse.getRequester()).isSameAs(requester);
        assertThat(existingReverse.getAddressee()).isSameAs(addressee);
        assertThat(existingReverse.getStatus()).isEqualTo(FriendStatus.BLOCKED);

        verify(friendsRepository).save(existingReverse);
    }

    @Test
    void blockUser_createsNewBlock_whenNoRelation() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));

        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.empty());
        when(friendsRepository.findByRequesterAndAddressee(addressee, requester)).thenReturn(Optional.empty());

        friendsService.blockUser(requesterId, addresseeId);

        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository).save(captor.capture());

        FriendsEntity saved = captor.getValue();
        assertThat(saved.getRequester()).isSameAs(requester);
        assertThat(saved.getAddressee()).isSameAs(addressee);
        assertThat(saved.getStatus()).isEqualTo(FriendStatus.BLOCKED);
    }

    @Test
    void unblockUser_deletes_whenBlocked() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        FriendsEntity block = FriendsEntity.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendStatus.BLOCKED)
                .build();

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));
        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.of(block));

        friendsService.unblockUser(requesterId, addresseeId);

        verify(friendsRepository).delete(block);
    }

    @Test
    void unblockUser_throws_whenNotFound() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));
        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendsService.unblockUser(requesterId, addresseeId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Blocked user was not found");

        verify(friendsRepository, never()).delete(any());
    }

    @Test
    void unblockUser_throws_whenRelationIsNotBlocked() {
        UUID requesterId = UUID.randomUUID();
        UUID addresseeId = UUID.randomUUID();

        UserEntity requester = user(requesterId, "req", null, UserStatus.ONLINE);
        UserEntity addressee = user(addresseeId, "add", null, UserStatus.ONLINE);

        FriendsEntity relation = FriendsEntity.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendStatus.FRIEND)
                .build();

        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(userRepository.findById(addresseeId)).thenReturn(Optional.of(addressee));
        when(friendsRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.of(relation));

        assertThatThrownBy(() -> friendsService.unblockUser(requesterId, addresseeId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Blocked user is not blocked");

        verify(friendsRepository, never()).delete(any());
    }

    @Test
    void getMyFriends_mapsBothDirections_andAppliesDefaults() {
        UUID meId = UUID.randomUUID();
        UUID f1Id = UUID.randomUUID();
        UUID f2Id = UUID.randomUUID();

        UserEntity me = user(meId, "me", "Me", UserStatus.ONLINE);

        // friend1: me is requester, friend has null displayName + null status => defaults
        UserEntity friend1 = user(f1Id, "f1", null, null);
        FriendsEntity rel1 = FriendsEntity.builder()
                .requester(me)
                .addressee(friend1)
                .status(FriendStatus.FRIEND)
                .build();

        // friend2: me is addressee, friend has displayName + ONLINE
        UserEntity friend2 = user(f2Id, "f2", "Friend Two", UserStatus.ONLINE);
        FriendsEntity rel2 = FriendsEntity.builder()
                .requester(friend2)
                .addressee(me)
                .status(FriendStatus.FRIEND)
                .build();

        when(friendsRepository.findAllAcceptedFriends(meId)).thenReturn(List.of(rel1, rel2));

        List<FriendDto> result = friendsService.getMyFriends(meId);

        assertThat(result).hasSize(2);

        FriendDto dto1 = result.stream().filter(d -> d.getId().equals(f1Id)).findFirst().orElseThrow();
        assertThat(dto1.getUsername()).isEqualTo("f1");
        assertThat(dto1.getDisplayName()).isEqualTo("f1"); // fallback
        assertThat(dto1.getStatus()).isEqualTo(FriendDto.StatusEnum.OFFLINE); // default OFFLINE
        assertThat(dto1.getFriendStatus()).isEqualTo(FriendDto.FriendStatusEnum.FRIEND);

        FriendDto dto2 = result.stream().filter(d -> d.getId().equals(f2Id)).findFirst().orElseThrow();
        assertThat(dto2.getUsername()).isEqualTo("f2");
        assertThat(dto2.getDisplayName()).isEqualTo("Friend Two");
        assertThat(dto2.getStatus()).isEqualTo(FriendDto.StatusEnum.ONLINE);
        assertThat(dto2.getFriendStatus()).isEqualTo(FriendDto.FriendStatusEnum.FRIEND);
    }

    @Test
    void getMyPendingRequests_mapsRequestersAsPending() {
        UUID meId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity requester = user(requesterId, "req", null, UserStatus.IDLE);

        FriendsEntity pending = FriendsEntity.builder()
                .requester(requester)
                .addressee(me)
                .status(FriendStatus.PENDING)
                .build();

        when(friendsRepository.findPendingFriendsForMe(meId)).thenReturn(List.of(pending));

        List<FriendDto> result = friendsService.getMyPendingRequests(meId);

        assertThat(result).hasSize(1);
        FriendDto dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(requesterId);
        assertThat(dto.getUsername()).isEqualTo("req");
        assertThat(dto.getFriendStatus()).isEqualTo(FriendDto.FriendStatusEnum.PENDING);
        assertThat(dto.getStatus()).isEqualTo(FriendDto.StatusEnum.IDLE);
    }

    @Test
    void getMyBlockedUsers_mapsAddresseesAsBlocked() {
        UUID meId = UUID.randomUUID();
        UUID blockedId = UUID.randomUUID();

        UserEntity me = user(meId, "me", null, UserStatus.ONLINE);
        UserEntity blocked = user(blockedId, "blocked", "Blocked User", UserStatus.DND);

        FriendsEntity block = FriendsEntity.builder()
                .requester(me)
                .addressee(blocked)
                .status(FriendStatus.BLOCKED)
                .build();

        when(friendsRepository.findBlockedByMe(meId)).thenReturn(List.of(block));

        List<FriendDto> result = friendsService.getMyBlockedUsers(meId);

        assertThat(result).hasSize(1);
        FriendDto dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(blockedId);
        assertThat(dto.getUsername()).isEqualTo("blocked");
        assertThat(dto.getDisplayName()).isEqualTo("Blocked User");
        assertThat(dto.getFriendStatus()).isEqualTo(FriendDto.FriendStatusEnum.BLOCKED);
        assertThat(dto.getStatus()).isEqualTo(FriendDto.StatusEnum.DND);
    }

    // ===== helpers =====

    private static UserEntity user(UUID id, String username, String displayName, UserStatus status) {
        return UserEntity.builder()
                .id(id)
                .username(username)
                .displayName(displayName)
                .status(status)
                .picture("pic")
                .about("about")
                .build();
    }
}
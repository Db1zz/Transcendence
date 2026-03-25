package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.FriendsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.FriendDto;
import com.anteiku.backend.model.FriendStatus;
import com.anteiku.backend.model.UserStatus;
import com.anteiku.backend.repository.FriendsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.FriendsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class FriendsServiceTests {
    @Mock
    private FriendsRepository friendsRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FriendsService friendsService;

    private UserEntity user1;
    private UserEntity user2;
    private UUID id1;
    private UUID id2;

    @BeforeEach
    void setUp() {
        id1 = UUID.randomUUID();
        id2 = UUID.randomUUID();

        user1 = new UserEntity();
        user1.setId(id1);
        user1.setUsername("user1");
        user1.setStatus(UserStatus.ONLINE);
        user1.setCreatedAt(Instant.now());

        user2 = new UserEntity();
        user2.setId(id2);
        user2.setUsername("user2");
        user2.setStatus(UserStatus.ONLINE);
        user2.setCreatedAt(Instant.now());
    }

    @Test
    void sendFriendRequestSuccessTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));
        when(friendsRepository.existsByRequesterAndAddressee(user1, user2)).thenReturn(false);
        when(friendsRepository.existsByRequesterAndAddressee(user2, user1)).thenReturn(false);

        friendsService.sendFriendRequest(id1, id2);

        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository, times(1)).save(captor.capture());

        assertEquals(FriendStatus.PENDING, captor.getValue().getStatus());
        assertEquals(user1, captor.getValue().getRequester());
        assertEquals(user2, captor.getValue().getAddressee());
    }

    @Test
    void sendFriendsSameIdsTest() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> friendsService.sendFriendRequest(id1, id1));

        assertEquals("requesterId and addresseeId can't be the same", exception.getMessage());
        verify(friendsRepository, never()).save(any());
    }

    @Test
    void sendFriendRequestAlreadyExistsTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));

        when(friendsRepository.existsByRequesterAndAddressee(user1, user2)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> friendsService.sendFriendRequest(id1, id2));

        verify(friendsRepository, never()).save(any());
    }

    @Test
    void acceptFriendRequestSuccessTest() {
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));

        FriendsEntity friendsEntity = new FriendsEntity();
        friendsEntity.setStatus(FriendStatus.PENDING);
        friendsEntity.setRequester(user1);
        friendsEntity.setAddressee(user2);

        when(friendsRepository.findByRequesterAndAddressee(user1, user2)).thenReturn(Optional.of(friendsEntity));

        friendsService.acceptFriendRequest(id2, id1);
        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository, times(1)).save(captor.capture());

        assertEquals(FriendStatus.FRIEND, captor.getValue().getStatus());
    }

    @Test
    void blockUserNoExistingRelationTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));
        when(friendsRepository.findByRequesterAndAddressee(user1, user2)).thenReturn(Optional.empty());
        when(friendsRepository.findByRequesterAndAddressee(user2, user1)).thenReturn(Optional.empty());

        friendsService.blockUser(id1, id2);

        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository, times(1)).save(captor.capture());

        assertEquals(FriendStatus.BLOCKED, captor.getValue().getStatus());
        assertEquals(user1, captor.getValue().getRequester());
    }

    @Test
    void blockUserExistingRelationTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));

        FriendsEntity friendsEntity = new FriendsEntity();
        friendsEntity.setStatus(FriendStatus.FRIEND);

        when(friendsRepository.findByRequesterAndAddressee(user1, user2)).thenReturn(Optional.of(friendsEntity));

        friendsService.blockUser(id1, id2);

        ArgumentCaptor<FriendsEntity> captor = ArgumentCaptor.forClass(FriendsEntity.class);
        verify(friendsRepository, times(1)).save(captor.capture());

        assertEquals(FriendStatus.BLOCKED, captor.getValue().getStatus());
    }

    @Test
    void unblockUserSuccessTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));

        FriendsEntity friendsEntity = new FriendsEntity();
        friendsEntity.setStatus(FriendStatus.BLOCKED);

        when(friendsRepository.findByRequesterAndAddressee(user1, user2)).thenReturn(Optional.of(friendsEntity));

        friendsService.unblockUser(id1, id2);

        verify(friendsRepository, times(1)).delete(friendsEntity);
    }

    @Test
    void unblockUserNotBlockedTest() {
        when(userRepository.findById(id1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(id2)).thenReturn(Optional.of(user2));

        FriendsEntity friendsEntity = new FriendsEntity();
        friendsEntity.setStatus(FriendStatus.FRIEND);

        when(friendsRepository.findByRequesterAndAddressee(user1, user2)).thenReturn(Optional.of(friendsEntity));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> friendsService.unblockUser(id1, id2));

        assertEquals("Blocked user is not blocked", exception.getMessage());
        verify(friendsRepository, never()).delete(friendsEntity);
    }

    @Test
    void getMyFriendsSuccessTest() {
        FriendsEntity friendsEntity = new FriendsEntity();
        friendsEntity.setStatus(FriendStatus.FRIEND);
        friendsEntity.setRequester(user1);
        friendsEntity.setAddressee(user2);

        when(friendsRepository.findAllAcceptedFriends(id1)).thenReturn(List.of(friendsEntity));

        List<FriendDto> friends = friendsService.getMyFriends(id1);

        assertEquals(1, friends.size());
        assertEquals("user2", friends.get(0).getUsername());
    }
}

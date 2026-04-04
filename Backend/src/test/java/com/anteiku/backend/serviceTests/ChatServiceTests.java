package com.anteiku.backend.serviceTests;


import com.anteiku.backend.entity.ChatMessageEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.ChatRoomDto;
import com.anteiku.backend.repository.ChatMessageRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTests {
    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    void saveChatSuccessTest() {
        UUID senderId = UUID.randomUUID();
        String roomId = "dm-room-1";

        ChatMessageRequest chatMessageRequest = new ChatMessageRequest();
        chatMessageRequest.setRoomId(roomId);
        chatMessageRequest.setSenderId(senderId);
        chatMessageRequest.setContent("hello world");

        ChatMessageEntity chatMessageEntity = new ChatMessageEntity();
        chatMessageEntity.setId(UUID.randomUUID());
        chatMessageEntity.setRoomId(roomId);
        chatMessageEntity.setSenderId(senderId);
        chatMessageEntity.setContent("hello world");
        chatMessageEntity.setCreatedAt(Instant.now());

        when(chatMessageRepository.save(any(ChatMessageEntity.class))).thenReturn(chatMessageEntity);

        ChatMessageResponse res = chatService.save(chatMessageRequest);

        ArgumentCaptor<ChatMessageEntity> captor = ArgumentCaptor.forClass(ChatMessageEntity.class);
        verify(chatMessageRepository, times(1)).save(captor.capture());

        assertEquals("hello world", captor.getValue().getContent());
        assertEquals(roomId, captor.getValue().getRoomId());
        assertEquals(senderId, captor.getValue().getSenderId());

        assertNotNull(res);
        assertEquals(chatMessageEntity.getId(), res.getId());
        assertNotNull(res.getCreatedAt());
    }

    @Test
    void lastMessagesSuccessTest() {
        String roomId = "dm-room-1";

        ChatMessageEntity msg1 = new ChatMessageEntity();
        msg1.setId(UUID.randomUUID());
        msg1.setContent("hello world1");
        msg1.setCreatedAt(Instant.now());

        ChatMessageEntity msg2 = new ChatMessageEntity();
        msg2.setId(UUID.randomUUID());
        msg2.setContent("hello world2");
        msg2.setCreatedAt(Instant.now());

        when(chatMessageRepository.findTop50ByRoomIdOrderByCreatedAtAsc(roomId)).thenReturn(List.of(msg1, msg2));

        List<ChatMessageResponse> res = chatService.lastMessages(roomId);

        assertEquals(2, res.size());
        assertEquals("hello world1", res.get(0).getContent());
        assertEquals("hello world2", res.get(1).getContent());
    }

    @Test
    void getUserChatRoomsSuccessTest() {
        UUID myId = UUID.randomUUID();
        UUID friendId = UUID.randomUUID();

        String validRoomId = "dm-" + myId.toString() + "-" + friendId.toString();

        UserEntity friend = new UserEntity();
        friend.setId(friendId);
        friend.setUsername("friend");
        friend.setPicture("example.jpg");

        when(chatMessageRepository.findDistinctRoomIdsByUserId(myId.toString())).thenReturn(List.of(validRoomId));
        when(userRepository.findById(friendId)).thenReturn(Optional.of(friend));

        List<ChatRoomDto> rooms = chatService.getUserChatRooms(myId);

        assertEquals(1, rooms.size());
        assertEquals(validRoomId, rooms.get(0).getRoomId());
        assertEquals(friendId, rooms.get(0).getOtherUserId());
        assertEquals("friend", rooms.get(0).getOtherUserName());
        assertEquals("example.jpg", rooms.get(0).getOtherUserPicture());
    }


    @Test
    void getUserChatRoomsIncorrectRoomNameTest() {
        UUID myId = UUID.randomUUID();
        List<String> roomsIds = List.of(
                "general-chat",
                "dm-tooshort",
                "dm-" + UUID.randomUUID().toString() + "invalid_uuid_string"
        );

        when(chatMessageRepository.findDistinctRoomIdsByUserId(myId.toString())).thenReturn(roomsIds);

        List<ChatRoomDto> rooms = chatService.getUserChatRooms(myId);

        assertTrue(rooms.isEmpty());
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void getUserChatRoomsNonExistentUserTest() {
        UUID myId = UUID.randomUUID();
        UUID nonExistentUserId = UUID.randomUUID();
        String roomId = "dm-" + myId.toString() + "-" + nonExistentUserId.toString();

        when(chatMessageRepository.findDistinctRoomIdsByUserId(myId.toString())).thenReturn(List.of(roomId));
        when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

        List<ChatRoomDto> rooms = chatService.getUserChatRooms(myId);

        assertTrue(rooms.isEmpty());
    }
}

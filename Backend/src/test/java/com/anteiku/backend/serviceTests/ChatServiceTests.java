package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.model.ChatChannelDto;
import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.repository.*;
import com.anteiku.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTests {

    @Mock private ChatMessageRepository chatMessageRepository;
    @Mock private ChannelRepository channelRepository;
    @Mock private ChannelMemberRepository channelMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrganizationRepository organizationRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    void saveChatSuccessTest() {
        UUID senderId = UUID.randomUUID();
        UUID channelId = UUID.randomUUID();

        ChatMessageRequest request = new ChatMessageRequest();
        request.setChannelId(channelId);
        request.setSenderId(senderId);
        request.setContent("hello world");

        ChannelEntity mockChannel = new ChannelEntity();
        mockChannel.setId(channelId);

        UserEntity mockSender = new UserEntity();
        mockSender.setId(senderId);

        ChatMessageEntity savedEntity = new ChatMessageEntity();
        savedEntity.setId(UUID.randomUUID());
        savedEntity.setChannel(mockChannel);
        savedEntity.setSender(mockSender);
        savedEntity.setContent("hello world");
        savedEntity.setCreatedAt(Instant.now());

        when(channelRepository.getReferenceById(channelId)).thenReturn(mockChannel);
        when(userRepository.getReferenceById(senderId)).thenReturn(mockSender);
        when(chatMessageRepository.save(any(ChatMessageEntity.class))).thenReturn(savedEntity);

        ChatMessageResponse res = chatService.save(request);

        ArgumentCaptor<ChatMessageEntity> captor = ArgumentCaptor.forClass(ChatMessageEntity.class);
        verify(chatMessageRepository, times(1)).save(captor.capture());

        assertEquals("hello world", captor.getValue().getContent());
        assertEquals(channelId, captor.getValue().getChannel().getId());

        assertNotNull(res);
        assertEquals(savedEntity.getId(), res.getId());
        assertNotNull(res.getCreatedAt());
    }

    @Test
    void getMessagesPaginatedSuccessTest() {
        UUID channelId = UUID.randomUUID();

        ChatMessageEntity msg1 = new ChatMessageEntity();
        msg1.setId(UUID.randomUUID());
        msg1.setContent("hello world1");
        msg1.setCreatedAt(Instant.now());

        ChatMessageEntity msg2 = new ChatMessageEntity();
        msg2.setId(UUID.randomUUID());
        msg2.setContent("hello world2");
        msg2.setCreatedAt(Instant.now());

        Page<ChatMessageEntity> mockPage = new PageImpl<>(List.of(msg1, msg2));

        when(chatMessageRepository.findByChannel_IdOrderByCreatedAtDesc(eq(channelId), any(PageRequest.class)))
                .thenReturn(mockPage);

        List<ChatMessageResponse> res = chatService.getMessagesPaginated(channelId, 0, 50);

        assertEquals(2, res.size());
        assertEquals("hello world1", res.get(0).getContent());
        assertEquals("hello world2", res.get(1).getContent());
    }

    @Test
    void getUserChatRoomsSuccessTest() {
        UUID myId = UUID.randomUUID();
        UUID channelId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        ChannelRepository.ChatChannelProjection mockProjection = mock(ChannelRepository.ChatChannelProjection.class);
        when(mockProjection.getChannelId()).thenReturn(channelId);
        when(mockProjection.getOtherUserId()).thenReturn(otherUserId);
        when(mockProjection.getOtherUserName()).thenReturn("Touka");
        when(mockProjection.getOtherUserPicture()).thenReturn("touka.png");

        when(channelRepository.findUserTextChannels(myId)).thenReturn(List.of(mockProjection));

        List<ChatChannelDto> rooms = chatService.getUserChatRooms(myId);

        assertEquals(1, rooms.size());
        assertEquals(channelId, rooms.get(0).getChannelId());
        assertEquals(otherUserId, rooms.get(0).getOtherUserId());
        assertEquals("Touka", rooms.get(0).getOtherUserName());
        assertEquals("touka.png", rooms.get(0).getOtherUserPicture());
    }

    @Test
    void createChannelReturnsExistingPrivateRoomTest() {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();
        UUID existingChannelId = UUID.randomUUID();
        when(channelRepository.findPrivateChannel(userA, userB)).thenReturn(existingChannelId);

        UUID resultId = chatService.createChannel("DM", ChannelType.TEXT, null, List.of(userA, userB));

        assertEquals(existingChannelId, resultId);
        verify(channelRepository, never()).save(any());
    }
}
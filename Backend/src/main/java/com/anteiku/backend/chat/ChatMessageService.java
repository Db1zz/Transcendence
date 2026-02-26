package com.anteiku.backend.chat;

import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.ChatRoomDto;
import com.anteiku.backend.entity.ChatMessageEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.repository.ChatMessageRepository;
import com.anteiku.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatMessageResponse save(ChatMessageRequest request) {
        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setRoomId(request.getRoomId());
        entity.setSenderId(request.getSenderId());
        entity.setContent(request.getContent());

        ChatMessageEntity saved = chatMessageRepository.save(entity);
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(saved.getId());
        response.setRoomId(saved.getRoomId());
        response.setSenderId(saved.getSenderId());
        response.setContent(saved.getContent());
        response.setCreatedAt(saved.getCreatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime());
        return response;
    }

    public List<ChatMessageResponse> lastMessages(String roomId) {
        return chatMessageRepository.findTop50ByRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(entity -> {
                    ChatMessageResponse response = new ChatMessageResponse();
                    response.setId(entity.getId());
                    response.setRoomId(entity.getRoomId());
                    response.setSenderId(entity.getSenderId());
                    response.setContent(entity.getContent());
                    response.setCreatedAt(entity.getCreatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public List<ChatRoomDto> getUserChatRooms(UUID userId) {
        List<String> roomIds = chatMessageRepository.findDistinctRoomIdsByUserId(userId.toString());
        List<ChatRoomDto> chatRooms = new ArrayList<>();
        
        for (String roomId : roomIds) {
            UUID otherUserId = extractOtherUserId(roomId, userId);
            if (otherUserId == null) continue;
            
            UserEntity otherUser = userRepository.findById(otherUserId).orElse(null);
            if (otherUser == null) continue;
            
            ChatRoomDto room = new ChatRoomDto();
            room.setRoomId(roomId);
            room.setOtherUserId(otherUserId);
            room.setOtherUserName(otherUser.getUsername());
            room.setOtherUserPicture(otherUser.getPicture());
            chatRooms.add(room);
        }
        
        return chatRooms;
    }
    
    private UUID extractOtherUserId(String roomId, UUID currentUserId) {
        if (!roomId.startsWith("dm-")) return null;
        
        String withoutPrefix = roomId.substring(3);
        if (withoutPrefix.length() < 73) return null;
        
        try {
            String uuid1Str = withoutPrefix.substring(0, 36);
            String uuid2Str = withoutPrefix.substring(37, 73);
            
            UUID userId1 = UUID.fromString(uuid1Str);
            UUID userId2 = UUID.fromString(uuid2Str);
            
            return currentUserId.equals(userId1) ? userId2 : userId1;
        } catch (IllegalArgumentException | StringIndexOutOfBoundsException e) {
            return null;
        }
    }
}

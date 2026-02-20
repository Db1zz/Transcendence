package com.anteiku.backend.chat;

import com.anteiku.backend.chat.dto.ChatMessageRequest;
import com.anteiku.backend.chat.dto.ChatMessageResponse;
import com.anteiku.backend.chat.dto.ChatRoomDto;
import com.anteiku.backend.entity.ChatMessageEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.repository.ChatMessageRepository;
import com.anteiku.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        entity.setRoomId(request.roomId());
        entity.setSenderId(request.senderId());
        entity.setContent(request.content());

        ChatMessageEntity saved = chatMessageRepository.save(entity);
        return new ChatMessageResponse(
                saved.getId(),
                saved.getRoomId(),
                saved.getSenderId(),
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    public List<ChatMessageResponse> lastMessages(String roomId) {
        return chatMessageRepository.findTop50ByRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(entity -> new ChatMessageResponse(
                        entity.getId(),
                        entity.getRoomId(),
                        entity.getSenderId(),
                        entity.getContent(),
                        entity.getCreatedAt()
                ))
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
            
            chatRooms.add(new ChatRoomDto(
                    roomId,
                    otherUserId,
                    otherUser.getUsername(),
                    otherUser.getPicture()
            ));
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

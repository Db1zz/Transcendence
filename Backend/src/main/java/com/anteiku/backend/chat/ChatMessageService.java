package com.anteiku.backend.chat;

import com.anteiku.backend.chat.dto.ChatMessageRequest;
import com.anteiku.backend.chat.dto.ChatMessageResponse;
import com.anteiku.backend.entity.ChatMessageEntity;
import com.anteiku.backend.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;

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
}

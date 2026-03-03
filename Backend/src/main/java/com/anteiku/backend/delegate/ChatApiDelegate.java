package com.anteiku.backend.delegate;

import com.anteiku.backend.api.ChatApi;
import com.anteiku.backend.service.ChatService;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.ChatRoomDto;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatApiDelegate implements ChatApi {
    private final ChatService chatService;

    @Override
    public ResponseEntity<List<ChatMessageResponse>> getRoomMessages(String roomId) {
        return ResponseEntity.ok().body(chatService.lastMessages(roomId));
    }
    
    @Override
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok().body(chatService.getUserChatRooms(userId));
    }
}

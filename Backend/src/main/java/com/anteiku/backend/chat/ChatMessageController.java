package com.anteiku.backend.chat;

import com.anteiku.backend.chat.dto.ChatMessageResponse;
import com.anteiku.backend.chat.dto.ChatRoomDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final HttpServletRequest request;

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessageResponse> getRoomMessages(@PathVariable String roomId) {
        return chatMessageService.lastMessages(roomId);
    }
    
    @GetMapping("/rooms")
    public List<ChatRoomDto> getUserChatRooms() {
        UUID userId = getCurrentUserId();
        return chatMessageService.getUserChatRooms(userId);
    }
    
    private UUID getCurrentUserId() {
        String headerId = request.getHeader("X-User-Id");
        
        if (headerId != null && !headerId.isEmpty()) {
            try {
                return UUID.fromString(headerId);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid UUID in X-User-Id");
            }
        }
        
        throw new RuntimeException("Missing UUID in X-User-Id");
    }
}

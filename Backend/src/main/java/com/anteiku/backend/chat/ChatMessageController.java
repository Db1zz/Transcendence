package com.anteiku.backend.chat;

import com.anteiku.backend.chat.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessageResponse> getRoomMessages(@PathVariable String roomId) {
        return chatMessageService.lastMessages(roomId);
    }
}

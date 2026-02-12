package com.anteiku.backend.chat;

import com.anteiku.backend.chat.dto.ChatMessageRequest;
import com.anteiku.backend.chat.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send")
    public void send(ChatMessageRequest request) {
        ChatMessageResponse saved = chatMessageService.save(request);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.roomId(), saved);
    }
}

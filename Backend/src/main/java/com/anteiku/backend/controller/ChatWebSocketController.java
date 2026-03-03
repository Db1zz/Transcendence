package com.anteiku.backend.controller;

import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void send(ChatMessageRequest request) {
        ChatMessageResponse saved = chatService.save(request);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoomId(), saved);
    }
}

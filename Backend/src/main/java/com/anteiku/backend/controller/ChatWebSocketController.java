package com.anteiku.backend.controller;

import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.notification.payload.DmPayload;
import com.anteiku.backend.notification.service.NotificationService;
import com.anteiku.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final NotificationService notificationService;

    @MessageMapping("/chat.send")
    public void send(ChatMessageRequest request) {
        ChatMessageResponse saved = chatService.save(request);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getChannelId(), saved);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoomId(), saved);

        // TODO
        UUID userId = chatService.extractOtherUserId(saved.getRoomId(), saved.getSenderId());
        DmPayload dmPayload = new DmPayload(userId.toString(), saved.getSenderId().toString(), saved.getRoomId(), saved.getContent(), System.currentTimeMillis());
        notificationService.sendToDm(dmPayload);
    }
}

package com.anteiku.backend.chat.dto;

import java.util.UUID;

public record ChatMessageRequest(
        String roomId,
        UUID senderId,
        String content
) {
}

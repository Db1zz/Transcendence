package com.anteiku.backend.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        String roomId,
        UUID senderId,
        String content,
        Instant createdAt
) {
}

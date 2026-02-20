package com.anteiku.backend.chat.dto;

import java.util.UUID;

public record ChatRoomDto(
        String roomId,
        UUID otherUserId,
        String otherUserName,
        String otherUserPicture
) {
}

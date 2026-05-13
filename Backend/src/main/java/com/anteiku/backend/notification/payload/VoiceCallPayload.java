package com.anteiku.backend.notification.payload;

import com.fasterxml.jackson.annotation.JsonProperty;

public record VoiceCallPayload (
        @JsonProperty("room_id")
        String roomId,

        @JsonProperty("sender_id")
        String senderId,

        @JsonProperty("user_id")
        String userId
) implements NotificationPayload {}
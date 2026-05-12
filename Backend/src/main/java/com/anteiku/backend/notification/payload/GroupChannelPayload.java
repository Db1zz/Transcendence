package com.anteiku.backend.notification.payload;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GroupChannelPayload(
    @JsonProperty("user_id")
    String userId,

    @JsonProperty("sender_id")
    String senderId,

    @JsonProperty("channel_name")
    String channelName,

    @JsonProperty("channel_id")
    String channelId,

    String content,

    long timestamp
) implements NotificationPayload {}
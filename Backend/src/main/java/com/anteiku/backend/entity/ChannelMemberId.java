package com.anteiku.backend.entity;

import lombok.Data;

@Data
public class ChannelMemberId {
    private UUID channelId;
    private UUID userId;
}

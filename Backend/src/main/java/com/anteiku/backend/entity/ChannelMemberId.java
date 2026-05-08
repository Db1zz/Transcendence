package com.anteiku.backend.entity;

import lombok.Data;

import java.util.UUID;

@Data
public class ChannelMemberId {
    private UUID channelId;
    private UUID userId;
}

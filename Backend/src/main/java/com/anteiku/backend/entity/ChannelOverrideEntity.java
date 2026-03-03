package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "channel_overrides")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChannelOverrideEntity {
    @EmbeddedId
    private ChannelOverrideId id;

    @MapsId("channelId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private ChannelEntity channel;
}

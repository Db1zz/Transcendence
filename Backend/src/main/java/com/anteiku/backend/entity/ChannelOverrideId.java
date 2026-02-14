package com.anteiku.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelOverrideId implements Serializable {
    private UUID channelId;
    private String entityType;
    private UUID entityId;
}

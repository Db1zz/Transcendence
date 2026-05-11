package com.anteiku.backend.entity;

import lombok.Data;

import java.util.Objects;
import java.util.UUID;

@Data
public class ChannelMemberId {
    private ChannelEntity channel;
    private UserEntity user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChannelMemberId that = (ChannelMemberId) o;
        return Objects.equals(channel, that.channel) &&
                Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(channel, user);
    }
}

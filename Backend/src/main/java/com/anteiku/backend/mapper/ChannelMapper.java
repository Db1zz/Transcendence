package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.model.ChannelDto;
import org.mapstruct.Mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring")
public interface ChannelMapper {
    default Instant map(OffsetDateTime value) {
        if (value == null) {
            return null;
        }
        return value.toInstant();
    }

    default OffsetDateTime map(Instant value) {
        if (value == null) {
            return null;
        }
        return OffsetDateTime.ofInstant(value, ZoneId.systemDefault());
    }

    ChannelDto toDto(ChannelEntity entity);
    ChannelEntity toEntity(ChannelDto dto);
}

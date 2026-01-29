package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserSessionDto;
import org.mapstruct.Mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Arrays;

@Mapper(componentModel = "spring")
public interface UserSessionMapper {
    default Instant map(OffsetDateTime value) {
        return value.toInstant();
    }

    default String map(byte[] value) {
        return Arrays.toString(value);
    }

    default OffsetDateTime map(Instant value) {
        return OffsetDateTime.ofInstant(value, ZoneId.systemDefault());
    }

    default byte[] map(String value) {
        return value.getBytes();
    }

    UserSessionDto toDto(UserSessionEntity userSessionEntity);
    UserSessionEntity toEntity(UserSessionDto userSessionDto);
}

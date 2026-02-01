package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserSessionDto;
import org.mapstruct.Mapper;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Base64;

@Mapper(componentModel = "spring")
public interface UserSessionMapper {
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

    default String map(byte[] value) {
        if (value == null) {
            return null;
        }
        return new String(value, StandardCharsets.UTF_8);
    }

    default byte[] map(String value) {
        if (value == null) {
            return null;
        }
        return value.getBytes(StandardCharsets.UTF_8);
    }

    UserSessionDto toDto(UserSessionEntity userSessionEntity);
    UserSessionEntity toEntity(UserSessionDto userSessionDto);
}

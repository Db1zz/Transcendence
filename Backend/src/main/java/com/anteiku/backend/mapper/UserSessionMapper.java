package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.model.UserSessionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserSessionMapper {
    UserSessionDto toDto(UserSessionEntity userSessionEntity);
    UserSessionEntity toEntity(UserSessionDto userSessionDto);
}

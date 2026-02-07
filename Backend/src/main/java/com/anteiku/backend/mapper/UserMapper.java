package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    UserEntity toEntity(UserPublicDto userDto);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "picture", ignore = true)
    @Mapping(target = "about", ignore = true)
    @Mapping(target = "displayName", source = "username")
    UserEntity toEntity(UserRegistrationDto userDto);
    UserPublicDto toDto(UserEntity userEntity);
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "user", ignore = true)
    UserCredentialsEntity toCredentialsEntity(UserRegistrationDto dto);
    UserCredentialsDto toCredentialsDto(UserCredentialsEntity userCredentialsEntity);
    List<UserEntity> toEntityList(List<UserPublicDto> userDtoList);
    List<UserPublicDto> toDtoList(List<UserEntity> userEntityList);
    default Instant map(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }
    default OffsetDateTime map(Instant value) {
        return value == null ? null : value.atZone(ZoneId.of("UTC")).toOffsetDateTime();
    }
}

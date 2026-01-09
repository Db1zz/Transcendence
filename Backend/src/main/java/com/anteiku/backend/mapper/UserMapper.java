package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserEntity toEntity(UserPublicDto userDto);
    UserEntity toEntity(UserRegistrationDto userDto);
    UserPublicDto toDto(UserEntity userEntity);

    UserCredentialsEntity toCredentialsEntity(UserRegistrationDto dto);
    UserCredentialsDto toCredentialsDto(UserCredentialsEntity userCredentialsEntity);

    List<UserEntity> toEntityList(List<UserPublicDto> userDtoList);
    List<UserPublicDto> toDtoList(List<UserEntity> userEntityList);
}

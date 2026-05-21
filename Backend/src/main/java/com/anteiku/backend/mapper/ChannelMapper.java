package com.anteiku.backend.mapper;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.model.ServerChannelDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChannelMapper {
    ServerChannelDto toDto(ChannelEntity channel);
    ChannelEntity toEntity(ServerChannelDto dto);
}

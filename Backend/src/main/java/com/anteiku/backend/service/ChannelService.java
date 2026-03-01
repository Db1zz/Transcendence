package com.anteiku.backend.service;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.ChannelType;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.ChannelMapper;
import com.anteiku.backend.model.ChannelDto;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.repository.ChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelMapper channelMapper;
    // private final OrganizationRepository organizationRepository;

    public ChannelDto createChannel(CreateChannelDto dto) {
//        OrganizationEntity organization = organizationRepository.findById(dto.getOrganizationId())
//                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + dto.getOrganizationId()));
//
//        if (channelRepository.existsByNameAndOrganizationId(dto.getName(), organization.getId())) {
//            throw new ConflictException("Channel with name '" + dto.getName() + "' already exists in this organization");
//        }

        ChannelType channelType;
        try {
            channelType = ChannelType.valueOf(dto.getChannelType().toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid channel type: " + dto.getChannelType());
        }

        ChannelEntity channel = ChannelEntity.builder()
                .name(dto.getName())
                .type(channelType)
//                .organization(organization)
                .createdAt(Instant.now())
                .build();

        channelRepository.save(channel);

        ChannelDto response = new ChannelDto();
        response.setId(channel.getId());
        response.setName(channel.getName());
//        response.setOrganizationId(organization.getId());
        response.setChannelType(ChannelDto.ChannelTypeEnum.valueOf(channel.getType().name()));
        response.setCreatedAt(OffsetDateTime.ofInstant(channel.getCreatedAt(), ZoneId.systemDefault()));

        return response;
    }

    public ChannelDto getChannel(UUID channelId) {
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        return channelMapper.toDto(channel);
    }

    public void deleteChannel(UUID channelId) {
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));

        channelRepository.delete(channel);
    }
}

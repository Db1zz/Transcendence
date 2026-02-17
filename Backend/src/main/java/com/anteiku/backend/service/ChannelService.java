package com.anteiku.backend.service;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.ChannelType;
import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.model.CreateChannelResponseDto;
import com.anteiku.backend.repository.ChannelRepository;
import com.anteiku.backend.repository.OrganizationRepository;
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
    private final OrganizationRepository organizationRepository;

    public CreateChannelResponseDto createChannel(CreateChannelDto dto) {
        OrganizationEntity organization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + dto.getOrganizationId()));

        if (channelRepository.existsByNameAndOrganizationId(dto.getName(), organization.getId())) {
            throw new ConflictException("Channel with name '" + dto.getName() + "' already exists in this organization");
        }

        ChannelType channelType;
        try {
            channelType = ChannelType.valueOf(dto.getChannelType().toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid channel type: " + dto.getChannelType());
        }

        ChannelEntity channel = ChannelEntity.builder()
                .name(dto.getName())
                .type(channelType)
                .organization(organization)
                .createdAt(Instant.now())
                .build();

        channelRepository.save(channel);
        
        CreateChannelResponseDto response = new CreateChannelResponseDto();
        response.setId(channel.getId());
        response.setName(channel.getName());
        response.setOrganizationId(organization.getId());
        response.setChannelType(CreateChannelResponseDto.ChannelTypeEnum.valueOf(channel.getType().name()));
        response.setCreatedAt(OffsetDateTime.ofInstant(channel.getCreatedAt(), ZoneId.systemDefault()));

        return response;
    }

    
    public void deleteChannel(UUID channelId) {
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));

        channelRepository.delete(channel);
    }
}

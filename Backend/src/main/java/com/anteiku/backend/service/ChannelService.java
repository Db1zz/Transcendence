package com.anteiku.backend.service;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.model.CreateChannelResponseDto;
import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.model.UpdateChannelDto;
import com.anteiku.backend.repository.ChannelMemberRepository;
import com.anteiku.backend.repository.ChannelRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.util.PermissionFlags;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final OrganizationRepository organizationRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    public CreateChannelResponseDto createChannel(CreateChannelDto dto) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        ChannelType channelType;
        try {
            channelType = ChannelType.valueOf(dto.getChannelType().toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid channel type: " + dto.getChannelType());
        }

        ChannelEntity.ChannelEntityBuilder channelBuilder = ChannelEntity.builder()
                .name(dto.getName())
                .type(channelType)
                .createdAt(Instant.now());

        if (dto.getOrganizationId() != null) {
            permissionService.verifyPermissions(dto.getOrganizationId(), currentUserId, PermissionFlags.MANAGE_CHANNELS);

            OrganizationEntity organizationEntity = organizationRepository.findById(dto.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

            if (channelRepository.existsByNameAndOrganizationId(dto.getName(), organizationEntity.getId())) {
                throw new ConflictException("Organization with '" + dto.getName() + "' already exists in this organization");
            }

            channelBuilder.organization(organizationEntity);
        }

        ChannelEntity channel = channelBuilder.build();
        channelRepository.save(channel);

        if (dto.getMemberIds() != null && !dto.getMemberIds().isEmpty()) {
            for (UUID memberId : dto.getMemberIds()) {
                UserEntity user = userRepository.getReferenceById(memberId);
                ChannelMemberEntity channelMember = new ChannelMemberEntity();
                channelMember.setChannel(channel);
                channelMember.setUser(user);
                channelMember.setJoinedAt(Instant.now());
                channelMemberRepository.save(channelMember);
            }
        }

        log.info("Channel created: '{}' of type {} (ID: {})", channel.getName(), channel.getType(), channel.getId());
        
        CreateChannelResponseDto response = new CreateChannelResponseDto();
        response.setId(channel.getId());
        response.setName(channel.getName());
        response.setOrganizationId(channel.getOrganization().getId());
        response.setChannelType(CreateChannelResponseDto.ChannelTypeEnum.valueOf(channel.getType().name()));
        response.setCreatedAt(OffsetDateTime.ofInstant(channel.getCreatedAt(), ZoneId.systemDefault()));

        return response;
    }

    public void deleteChannel(UUID channelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));

        if (channel.getOrganization() != null) {
            permissionService.verifyPermissions(channel.getOrganization().getId(), currentUserId, PermissionFlags.MANAGE_CHANNELS);
        }

        channelRepository.delete(channel);
        log.info("Channel deleted: '{}' of type {}", channel.getName(), channel.getType());
    }

    public List<ChannelMemberEntity> getChannelMembers(UUID channelId) {
        return channelMemberRepository.findByChannelId(channelId);
    }

    public ChannelEntity getChannel(UUID channelId) {
        return channelRepository.findById(channelId).orElseThrow(
                () -> new ResourceNotFoundException("Channel with id " + channelId + " not found")
        );
    }

    public ServerChannelDto updateChannel(UUID channelId, UpdateChannelDto dto) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel with id " + channelId + " not found"));

        if (channel.getOrganization() != null) {
            permissionService.verifyPermissions(channel.getOrganization().getId(), currentUserId, PermissionFlags.MANAGE_CHANNELS);
            if (!channel.getName().equals(dto.getName())) {
                if (channelRepository.existsByNameAndOrganizationId(dto.getName(), channel.getOrganization().getId())) {
                    throw new ConflictException("A channel with name '" + dto.getName() + "' already exists in this organization");
                }

                channel.setName(dto.getName());
            }
        } else {
            throw new ConflictException("Direct message channels cannot be renamed");
        }

        channelRepository.save(channel);

        ServerChannelDto response = new ServerChannelDto();
        response.setId(channel.getId());
        response.setName(channel.getName());
        response.setType(ServerChannelDto.TypeEnum.valueOf(channel.getType().name()));
        response.setOrganizationId(channel.getOrganization().getId());

        return response;
    }
}

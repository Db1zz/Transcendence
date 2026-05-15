package com.anteiku.backend.service;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.OrganizationMemberEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.model.OrganizationDto;
import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.repository.ChannelRepository;
import com.anteiku.backend.repository.OrganizationMemberRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final ChannelRepository channelRepository;

    public CreateOrganizationResponseDto createOrganization(CreateOrganizationDto dto) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserEntity owner = userRepository.findUserById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        if (organizationRepository.existsByName(dto.getName())) {
            throw new ConflictException("Organization with name '" + dto.getName() + "' already exists");
        }

        OrganizationEntity organization = OrganizationEntity.builder()
                .name(dto.getName())
                .owner(owner)
                .createdAt(Instant.now())
                .build();

        organizationRepository.save(organization);

        OrganizationMemberEntity ownerMember = new OrganizationMemberEntity();
        ownerMember.setOrganization(organization);
        ownerMember.setUser(owner);
        ownerMember.setJoinedAt(Instant.now());
        organizationMemberRepository.save(ownerMember);

        ChannelEntity generalText = ChannelEntity.builder()
                .name("general")
                .type(com.anteiku.backend.entity.ChannelType.TEXT)
                .organization(organization)
                .build();
        channelRepository.save(generalText);

        ChannelEntity generalVoice = ChannelEntity.builder()
                .name("general voice")
                .type(com.anteiku.backend.entity.ChannelType.VOICE)
                .organization(organization)
                .build();
        channelRepository.save(generalVoice);

        log.info("Organization created: '{}' (ID: {}) by Owner ID {}", organization.getName(), organization.getId(), currentUserId);

        CreateOrganizationResponseDto createOrganizationResponseDto = new CreateOrganizationResponseDto();
        createOrganizationResponseDto.setId(organization.getId());
        createOrganizationResponseDto.setName(organization.getName());
        createOrganizationResponseDto.setOwnerId(owner.getId());
        createOrganizationResponseDto.setCreatedAt(OffsetDateTime.ofInstant(organization.getCreatedAt(), ZoneId.systemDefault()));

        return createOrganizationResponseDto;
    }

    public List<OrganizationDto> getMyOrganizations() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        return organizationRepository.findOrganizationsByUserId(currentUserId).stream()
                .map(org -> {
                    OrganizationDto dto = new OrganizationDto();
                    dto.setId(org.getId());
                    dto.setName(org.getName());
                    dto.setOwnerId(org.getOwner().getId());
                    dto.setCreatedAt(OffsetDateTime.ofInstant(org.getCreatedAt(), ZoneId.systemDefault()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<ServerChannelDto> getOrganizationChannels(UUID organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found");
        }

        return channelRepository.findByOrganizationId(organizationId).stream()
                .map(channel -> {
                    ServerChannelDto dto = new ServerChannelDto();
                    dto.setId(channel.getId());
                    dto.setName(channel.getName());
                    dto.setType(ServerChannelDto.TypeEnum.valueOf(channel.getType().name()));
                    dto.setOrganizationId(channel.getOrganization().getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void deleteOrganization(UUID organizationId) {
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!organization.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can delete organization");
        }

        organizationRepository.delete(organization);
        log.info("Organization deleted: ID {} by Owner ID {}",  organization.getId(), currentUserId);
    }
}
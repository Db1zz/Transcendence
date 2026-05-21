package com.anteiku.backend.service;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.ChannelMapper;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.*;
import com.anteiku.backend.util.PermissionFlags;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
    private final OrganizationInviteRepository organizationInviteRepository;
    private final RoleRepository roleRepository;
    private final ChannelMapper channelMapper;

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

        RoleEntity ownerRole = new RoleEntity();
        ownerRole.setName("Owner");
        ownerRole.setOrganization(organization);
        ownerRole.setPermissionMask(PermissionFlags.ADMINISTRATOR);
        ownerRole.setCreatedAt(Instant.now());
        ownerRole = roleRepository.save(ownerRole);

        RoleEntity memberRole = new RoleEntity();
        memberRole.setName("Member");
        memberRole.setOrganization(organization);
        memberRole.setPermissionMask(PermissionFlags.SEND_MESSAGES |  PermissionFlags.CONNECT_VOICE);
        memberRole.setCreatedAt(Instant.now());
        roleRepository.save(memberRole);

        OrganizationMemberEntity ownerMember = new OrganizationMemberEntity();
        ownerMember.setOrganization(organization);
        ownerMember.setUser(owner);
        ownerMember.setJoinedAt(Instant.now());
        ownerMember.setRoles(Set.of(ownerRole));
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

    public List<OrganizationDto> getUserOrganizations(UUID userId) {
        return organizationRepository.findOrganizationsByUserId(userId).stream()
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

    public List<OrganizationDto> getMyOrganizations() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return getUserOrganizations(currentUserId);
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

    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return sb.toString();
    }

    public InviteDto createInvite(UUID organizationId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        boolean isMember = organizationMemberRepository.existsByUserIdAndOrganizationId(currentUserId, organizationId);
        if (!isMember) {
            throw new AccessDeniedException("You must be a member of this organization");
        }

        Optional<OrganizationInviteEntity> existingInvite = organizationInviteRepository
                .findFirstByOrganizationIdAndCreatorIdAndExpiresAtAfter(organizationId, currentUserId, Instant.now());
        if (existingInvite.isPresent()) {
            OrganizationInviteEntity activeInvite = existingInvite.get();
            InviteDto dto = new InviteDto();
            dto.setCode(activeInvite.getCode());
            dto.setOrganizationId(activeInvite.getOrganization().getId());
            dto.setExpiresAt(OffsetDateTime.ofInstant(activeInvite.getExpiresAt(), ZoneId.systemDefault()));
            return dto;
        }

        OrganizationEntity org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        UserEntity creator = userRepository.getReferenceById(currentUserId);

        String inviteCode;
        int maxRetry = 10;
        int attempts = 0;
        do {
            inviteCode = generateInviteCode();
            attempts++;
            if (attempts > maxRetry) {
                throw new ConflictException("Failed to generate invite code");
            }
        } while (organizationInviteRepository.existsById(inviteCode));

        OrganizationInviteEntity invite = OrganizationInviteEntity.builder()
                .code(inviteCode)
                .organization(org)
                .creator(creator)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plus(1, ChronoUnit.DAYS))
                .build();
        organizationInviteRepository.save(invite);

        log.info("User {} created a new invite code [{}] for Organization {}", currentUserId, inviteCode, organizationId);

        InviteDto inviteDto = new InviteDto();
        inviteDto.setCode(invite.getCode());
        inviteDto.setOrganizationId(org.getId());
        inviteDto.setExpiresAt(OffsetDateTime.ofInstant(invite.getExpiresAt(), ZoneId.systemDefault()));

        return inviteDto;
    }

    public OrganizationDto joinWithInvite(String inviteCode) {
        UUID  currentUserId = SecurityUtils.getCurrentUserId();
        OrganizationInviteEntity invite = organizationInviteRepository.findById(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Organization invite not found"));

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new ConflictException("Invite expired");
        }

        OrganizationEntity org = invite.getOrganization();
        UserEntity user = userRepository.getReferenceById(currentUserId);

        boolean isAlreadyMember = organizationMemberRepository.existsByUserIdAndOrganizationId(currentUserId, org.getId());
        if (isAlreadyMember) {
            throw new ConflictException("You are already member of this organization");
        }

        OrganizationMemberEntity member = new OrganizationMemberEntity();
        member.setOrganization(org);
        member.setUser(user);
        member.setJoinedAt(Instant.now());

        List<RoleEntity> orgRoles = roleRepository.findByOrganizationId(org.getId());
        orgRoles.stream()
                .filter(r -> r.getName().equals("Member"))
                .findFirst()
                .ifPresent(memberRole -> member.setRoles(Set.of(memberRole)));

        organizationMemberRepository.save(member);

        log.info("User {} joined server {} via invite code [{}]", currentUserId, org.getId(), inviteCode);

        OrganizationDto orgDto = new OrganizationDto();
        orgDto.setId(org.getId());
        orgDto.setName(org.getName());
        orgDto.setOwnerId(org.getOwner().getId());
        orgDto.setCreatedAt(OffsetDateTime.ofInstant(org.getCreatedAt(), ZoneId.systemDefault()));
        return orgDto;
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredInvites() {
        log.info("Running scheduled cleanup of invite codes in db...");
        organizationInviteRepository.deleteByExpiresAtBefore(Instant.now());
    }

    public List<ServerChannelDto> getOrganizationVoiceChannels(UUID organizationId) {
        List<ChannelEntity> channels = channelRepository.findByOrganization_IdAndType(organizationId, ChannelType.VOICE);
        return channels.stream().map(channelMapper::toDto).toList();
    }
}

package com.anteiku.backend.service;

import com.anteiku.backend.entity.OrganizationMemberEntity;
import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.AddMemberDto;
import com.anteiku.backend.model.AddMemberResponseDto;
import com.anteiku.backend.model.ServerMemberDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.repository.OrganizationMemberRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.RoleRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.util.PermissionFlags;
import com.anteiku.backend.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganizationMemberService {
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final PermissionService permissionService;

    public AddMemberResponseDto addMember(AddMemberDto addMemberDto) {
        if (organizationMemberRepository.existsByUserIdAndOrganizationId(addMemberDto.getUserId(), addMemberDto.getOrganizationId())) {
            throw new ConflictException("User with id '" + addMemberDto.getUserId() + "' is already a member of organization '" + addMemberDto.getOrganizationId() + "'");
        }

        UserEntity userEntity = userRepository.findById(addMemberDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User with id '" + addMemberDto.getUserId() + "' was not found"));

        OrganizationEntity organizationEntity = organizationRepository.findById(addMemberDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization with id '" + addMemberDto.getOrganizationId() + "' was not found"));

        OrganizationMemberEntity organizationMemberEntity = new OrganizationMemberEntity();
        organizationMemberEntity.setUser(userEntity);
        organizationMemberEntity.setOrganization(organizationEntity);
        organizationMemberEntity.setJoinedAt(Instant.now());
        organizationMemberRepository.save(organizationMemberEntity);

        AddMemberResponseDto addMemberResponseDto = new AddMemberResponseDto();
        addMemberResponseDto.setId(organizationMemberEntity.getId());
        addMemberResponseDto.setUserId(userEntity.getId());
        addMemberResponseDto.setOrganizationId(organizationEntity.getId());
        addMemberResponseDto.setJoinedAt(OffsetDateTime.ofInstant(organizationMemberEntity.getJoinedAt(), ZoneId.systemDefault()));

        return addMemberResponseDto;
    }

    public void removeMember(UUID memberId) {
        OrganizationMemberEntity organizationMemberEntity = organizationMemberRepository.findById(memberId)
                        .orElseThrow(() -> new ResourceNotFoundException("Member with id '" + memberId + "' was not found"));

        organizationMemberRepository.delete(organizationMemberEntity);
    }

    public boolean isUserMemberOfOrganization(UUID memberId, UUID organizationId) {
        return organizationMemberRepository.existsByUserIdAndOrganizationId(memberId, organizationId);
    }

    public List<ServerMemberDto> getOrganizationMembers(UUID memberId, UUID organizationId) {
        permissionService.calculatePermissions(organizationId, memberId);
        return organizationMemberRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToMemberDto)
                .collect(Collectors.toList());
    }

    public List<ServerMemberDto> getOrganizationMembers(UUID organizationId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return getOrganizationMembers(currentUserId, organizationId);
    }

    public void updateMemberRoles(UUID memberId, List<UUID> roleIds) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        OrganizationMemberEntity member = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member with id '" + memberId + "' was not found"));
        UUID orgId = member.getOrganization().getId();

        permissionService.verifyPermissions(orgId, currentUserId, PermissionFlags.MANAGE_ROLES);
        List<RoleEntity> rolesToAssign = roleRepository.findAllById(roleIds);

        for (RoleEntity roleEntity : rolesToAssign) {
            if (!roleEntity.getOrganization().getId().equals(orgId)) {
                throw new ConflictException("Role does not belong to this organization");
            }
        }

        member.setRoles(new HashSet<>(rolesToAssign));
        organizationMemberRepository.save(member);
    }

    private ServerMemberDto mapToMemberDto(OrganizationMemberEntity organizationMemberEntity) {
        ServerMemberDto serverMemberDto = new ServerMemberDto();
        serverMemberDto.setId(organizationMemberEntity.getId());
        serverMemberDto.setJoinedAt(OffsetDateTime.ofInstant(organizationMemberEntity.getJoinedAt(),  ZoneId.systemDefault()));

        List<UUID> roleIds = organizationMemberEntity.getRoles().stream()
                .map(RoleEntity::getId)
                .collect(Collectors.toList());
        serverMemberDto.setRoles(roleIds);

        UserEntity userEntity = organizationMemberEntity.getUser();
        UserPublicDto userPublicDto = new UserPublicDto();
        userPublicDto.setId(userEntity.getId());
        userPublicDto.setUsername(userEntity.getUsername());
        userPublicDto.setDisplayName(userEntity.getDisplayName());
        userPublicDto.setPicture(userEntity.getPicture());
        userPublicDto.setStatus(UserPublicDto.StatusEnum.OFFLINE);
        serverMemberDto.setUser(userPublicDto);
        return serverMemberDto;
    }
}

package com.anteiku.backend.service;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import com.anteiku.backend.model.UpdateRoleDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.RoleRepository;
import com.anteiku.backend.util.PermissionFlags;
import com.anteiku.backend.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PermissionService permissionService;

    public CreateRoleResponseDto createNewRole(CreateRoleDto createRoleDto) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UUID orgId = createRoleDto.getOrganizationId();

        permissionService.verifyPermissions(orgId, currentUserId, PermissionFlags.MANAGE_ROLES);

        OrganizationEntity organizationEntity = organizationRepository.findById(createRoleDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization with id '"  + createRoleDto.getOrganizationId() + "' not found"));

        if (roleRepository.existsByNameAndOrganizationId(createRoleDto.getName(), createRoleDto.getOrganizationId())) {
            throw new ConflictException("Role with name '" + createRoleDto.getName() + "' is already exists in organization '" + createRoleDto.getOrganizationId() + "'");
        }

        RoleEntity roleEntity = new RoleEntity();
        roleEntity.setName(createRoleDto.getName());
        roleEntity.setOrganization(organizationEntity);
        roleEntity.setPermissionMask(createRoleDto.getPermissions() != null ? createRoleDto.getPermissions() : 0L);
        roleEntity.setCreatedAt(Instant.now());

        roleRepository.save(roleEntity);
        return mapToDto(roleEntity);
    }

    public List<CreateRoleResponseDto> getOrganizationRoles(UUID organizationId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        permissionService.calculatePermissions(organizationId, currentUserId);

        return roleRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteRole(UUID roleId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role with id '" + roleId + "' was not found"));
        UUID organizationId = roleEntity.getOrganization().getId();
        permissionService.verifyPermissions(organizationId, currentUserId, PermissionFlags.MANAGE_ROLES);
        roleRepository.delete(roleEntity);
    }

    public CreateRoleResponseDto updateRole(UUID roleId, UpdateRoleDto updateRoleDto) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role with id '" + roleId + "' was not found"));
        UUID organizationId = role.getOrganization().getId();

        permissionService.verifyPermissions(organizationId, currentUserId, PermissionFlags.MANAGE_ROLES);

        if (updateRoleDto.getName() != null && !updateRoleDto.getName().equals(role.getName())) {
            if (roleRepository.existsByNameAndOrganizationId(updateRoleDto.getName(), organizationId)) {
                throw new ConflictException("Another role with this name already exists.");
            }
            role.setName(updateRoleDto.getName());
        }

        if (updateRoleDto.getPermissions() != null) {
            role.setPermissionMask(updateRoleDto.getPermissions());
        }

        roleRepository.save(role);
        return mapToDto(role);
    }

    private CreateRoleResponseDto mapToDto(RoleEntity roleEntity) {
        CreateRoleResponseDto dto = new CreateRoleResponseDto();
        dto.setId(roleEntity.getId());
        dto.setName(roleEntity.getName());
        dto.setOrganizationId(roleEntity.getOrganization().getId());
        dto.setPermissions(roleEntity.getPermissionMask());
        dto.setCreatedAt(OffsetDateTime.ofInstant(roleEntity.getCreatedAt(), ZoneId.systemDefault()));
        return dto;
    }
}

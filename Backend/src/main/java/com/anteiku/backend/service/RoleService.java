package com.anteiku.backend.service;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;

    public CreateRoleResponseDto createNewRole(CreateRoleDto createRoleDto) {
        OrganizationEntity organizationEntity = organizationRepository.findById(createRoleDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization with id '"  + createRoleDto.getOrganizationId() + "' not found"));

        if (roleRepository.existsByNameAndOrganizationId(createRoleDto.getName(), createRoleDto.getOrganizationId())) {
            throw new ResourceNotFoundException("Role with name '" + createRoleDto.getName() + "' is already exists in organization '" + createRoleDto.getOrganizationId() + "'");
        }

        RoleEntity roleEntity = new RoleEntity();
        roleEntity.setName(createRoleDto.getName());
        roleEntity.setOrganization(organizationEntity);
        roleEntity.setCreatedAt(Instant.now());

        roleRepository.save(roleEntity);

        CreateRoleResponseDto createRoleResponseDto = new CreateRoleResponseDto();
        createRoleResponseDto.setName(roleEntity.getName());
        createRoleResponseDto.setOrganizationId(organizationEntity.getId());
        createRoleResponseDto.setCreatedAt(OffsetDateTime.ofInstant(roleEntity.getCreatedAt(), ZoneId.systemDefault()));

        return createRoleResponseDto;
    }

    public void deleteRole(UUID roleId) {
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role with id '" + roleId + "' was not found"));

        roleRepository.delete(roleEntity);
    }

}

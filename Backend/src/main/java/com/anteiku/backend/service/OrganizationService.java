package com.anteiku.backend.service;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.util.SecurityUtils;
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
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

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

        System.out.println("org id: " + organization.getId());
        organizationRepository.save(organization);

        CreateOrganizationResponseDto createOrganizationResponseDto = new CreateOrganizationResponseDto();
        createOrganizationResponseDto.setId(organization.getId());
        createOrganizationResponseDto.setName(organization.getName());
        createOrganizationResponseDto.setOwnerId(owner.getId());
        createOrganizationResponseDto.setCreatedAt(OffsetDateTime.ofInstant(organization.getCreatedAt(), ZoneId.systemDefault()));

        return createOrganizationResponseDto;
    }

    public void deleteOrganization(UUID organizationId) {
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!organization.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can delete organization");
        }

        organizationRepository.delete(organization);
    }
}
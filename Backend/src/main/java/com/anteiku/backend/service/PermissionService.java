package com.anteiku.backend.service;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.OrganizationMemberEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.repository.OrganizationMemberRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.util.PermissionFlags;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public Long calculatePermissions(UUID organizationId, UUID userId) {
        OrganizationEntity organizationEntity = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (organizationEntity.getOwner().getId().equals(userId)) {
            return PermissionFlags.ADMINISTRATOR;
        }

        OrganizationMemberEntity member =  organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this organization"));

        long totalPermissions = 0L;
        for (RoleEntity role : member.getRoles()) {
            totalPermissions = totalPermissions | role.getPermissionMask();
        }

        return totalPermissions;
    }

    public void verifyPermissions(UUID organizationId, UUID userId, Long requiredPermission) {
        Long userBitmask = calculatePermissions(organizationId, userId);

        if (!PermissionFlags.hasPermission(userBitmask, requiredPermission)) {
            throw new AccessDeniedException("You do not have required permissions to perform this operation");
        }
    }
}

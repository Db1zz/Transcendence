package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMemberEntity, UUID> {
    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    Optional<OrganizationMemberEntity> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
    List<OrganizationMemberEntity> findByOrganizationId(UUID organizationId);
}

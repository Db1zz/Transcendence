package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMemberEntity, UUID> {
    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}

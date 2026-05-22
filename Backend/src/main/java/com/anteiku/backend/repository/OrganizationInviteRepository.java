package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationInviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.Instant;
import java.util.UUID;

@Repository
public interface OrganizationInviteRepository extends JpaRepository<OrganizationInviteEntity, String> {
    Optional<OrganizationInviteEntity> findFirstByOrganizationIdAndCreatorIdAndExpiresAtAfter(UUID organizationId, UUID creatorId, Instant now);
    void deleteByExpiresAtBefore(Instant now);
    void deleteByOrganizationId(UUID organizationId);
}

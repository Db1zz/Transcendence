package com.anteiku.backend.repository;

import com.anteiku.backend.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, UUID> {
//    @Query("SELECT m FROM MemberEntity m WHERE (m.user.id = :userId AND m.organization.id = :organizationId)")
//    Optional<MemberEntity> findByUserIdInOrganizationId(@Param("userId") UUID userId, @Param("organizationId") UUID organizationId);

    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}

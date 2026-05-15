package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {
    boolean existsByName(String name);
    @Query("SELECT o FROM OrganizationEntity o JOIN OrganizationMemberEntity m ON o.id = m.organization.id WHERE m.user.id = :userId")
    List<OrganizationEntity> findOrganizationsByUserId(@Param("userId") UUID userId);
}

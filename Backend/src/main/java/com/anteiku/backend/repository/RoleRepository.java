package com.anteiku.backend.repository;

import com.anteiku.backend.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    boolean existsByNameAndOrganizationId(String name, UUID organizationId);
}

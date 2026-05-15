package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationMemberRoleEntity;
import com.anteiku.backend.entity.OrganizationMemberRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationMemberRoleRepository extends JpaRepository<OrganizationMemberRoleEntity, OrganizationMemberRoleId> {
}

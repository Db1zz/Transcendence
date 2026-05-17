package com.anteiku.backend.repository;

import com.anteiku.backend.entity.OrganizationInviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationInviteRepository extends JpaRepository<OrganizationInviteEntity, String> {
}

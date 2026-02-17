package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChannelRepository extends JpaRepository<ChannelEntity, UUID> {
    boolean existsByNameAndOrganizationId(String name, UUID  organizationId);
}

package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChannelRepository extends JpaRepository<ChannelEntity, UUID> {
}

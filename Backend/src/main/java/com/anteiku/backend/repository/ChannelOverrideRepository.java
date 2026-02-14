package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelOverrideEntity;
import com.anteiku.backend.entity.ChannelOverrideId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelOverrideRepository extends JpaRepository<ChannelOverrideEntity, ChannelOverrideId> {

}

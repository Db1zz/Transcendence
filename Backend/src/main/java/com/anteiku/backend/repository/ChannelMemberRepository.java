package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelMemberEntity;
import com.anteiku.backend.entity.ChannelMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChannelMemberRepository extends JpaRepository<ChannelMemberEntity, ChannelMemberId> {
    List<ChannelMemberEntity> findByChannelId(UUID channelId);
    boolean existsByChannel_IdAndUser_Id(UUID channelId, UUID userId);
    void deleteByChannel_IdAndUser_Id(UUID channelId, UUID userId);
}

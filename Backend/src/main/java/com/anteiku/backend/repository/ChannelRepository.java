package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.model.ChatRoomDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<ChannelEntity, UUID> {
    @Query("SELECT new com.anteiku.backend.model.ChatRoomDto(" +
            "c.id, u.id, u.username, u.picture) " +
            "FROM ChannelEntity c " +
            "JOIN ChannelMemberEntity cm1 ON c.id = cm1.channelId " +
            "JOIN ChannelMemberEntity cm2 ON c.id = cm2.channelId " +
            "JOIN UserEntity u ON cm2.userId = u.id " +
            "WHERE c.type = 'TEXT' " +
            "AND cm1.userId = :userId " +
            "AND cm2.userId != :userId")
    List<ChatRoomDto> findUserTextChannels(@Param("userId") UUID userId);
}

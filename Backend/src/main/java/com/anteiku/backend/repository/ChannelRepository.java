package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.model.ChatChannelDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<ChannelEntity, UUID> {

    @Query("SELECT new com.anteiku.backend.model.ChatChannelDto(" +
            "c.id, u.id, u.username, u.picture) " +
            "FROM ChannelEntity c " +
            "JOIN ChannelMemberEntity cm1 ON c.id = cm1.channel.id " +
            "JOIN ChannelMemberEntity cm2 ON c.id = cm2.channel.id " +
            "JOIN UserEntity u ON cm2.user.id = u.id " +
            "WHERE c.type = 'TEXT' AND c.organization IS NULL " +
            "AND cm1.user.id = :userId " +
            "AND cm2.user.id != :userId")
    List<ChatChannelDto> findUserTextChannels(@Param("userId") UUID userId);

    @Query("SELECT c.id FROM ChannelEntity c " +
            "JOIN ChannelMemberEntity cm1 ON c.id = cm1.channel.id " +
            "JOIN ChannelMemberEntity cm2 ON c.id = cm2.channel.id " +
            "WHERE c.type = 'TEXT' AND c.organization IS NULL " +
            "AND cm1.user.id = :userA AND cm2.user.id = :userB")
    UUID findPrivateChannel(@Param("userA") UUID userA, @Param("userB") UUID userB);
}
package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.ChannelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<ChannelEntity, UUID> {
    Optional<ChannelEntity> findById(UUID channelId);

    interface ChatChannelProjection {
        UUID getChannelId();
        UUID getOtherUserId();
        String getOtherUserName();
        String getOtherUserPicture();
    }

    @Query("SELECT c.id AS channelId, u.id AS otherUserId, u.username AS otherUserName, u.picture AS otherUserPicture " +
            "FROM ChannelEntity c " +
            "JOIN ChannelMemberEntity cm1 ON c.id = cm1.channel.id " +
            "JOIN ChannelMemberEntity cm2 ON c.id = cm2.channel.id " +
            "JOIN UserEntity u ON cm2.user.id = u.id " +
            "WHERE c.type = 'TEXT' AND c.organization IS NULL " +
            "AND cm1.user.id = :userId " +
            "AND cm2.user.id != :userId")
    List<ChatChannelProjection> findUserTextChannels(@Param("userId") UUID userId);

    @Query("SELECT c.id FROM ChannelEntity c " +
            "JOIN ChannelMemberEntity cm1 ON c.id = cm1.channel.id " +
            "JOIN ChannelMemberEntity cm2 ON c.id = cm2.channel.id " +
            "WHERE c.type = 'TEXT' AND c.organization IS NULL " +
            "AND cm1.user.id = :userA AND cm2.user.id = :userB")
    UUID findPrivateChannel(@Param("userA") UUID userA, @Param("userB") UUID userB);
    List<ChannelEntity> findByOrganizationId(UUID organizationId);

    List<ChannelEntity> findByOrganization_IdAndType(UUID organizationId, ChannelType type);
}
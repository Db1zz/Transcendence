package com.anteiku.backend.repository;

import com.anteiku.backend.entity.UserSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionsRepository extends JpaRepository<UserSessionEntity, UUID> {
    // Optional<UserSessionEntity> findByUserId(UUID userId);
    Optional<UserSessionEntity> findByRefreshToken(String token);
}

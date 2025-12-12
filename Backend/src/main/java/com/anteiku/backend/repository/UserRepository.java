package com.anteiku.backend.repository;

import com.anteiku.backend.entity.UserEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findUserById(UUID userId);
    List<UserEntity> findUserByUsername(String username);
}

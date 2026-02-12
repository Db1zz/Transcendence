package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, UUID> {
    List<ChatMessageEntity> findTop50ByRoomIdOrderByCreatedAtAsc(String roomId);
}

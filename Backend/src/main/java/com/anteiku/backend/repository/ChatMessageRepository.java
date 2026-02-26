package com.anteiku.backend.repository;

import com.anteiku.backend.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, UUID> {
    List<ChatMessageEntity> findTop50ByRoomIdOrderByCreatedAtAsc(String roomId);
    
    @Query(value = "SELECT DISTINCT room_id FROM chat_messages WHERE sender_id = CAST(:userId AS uuid) OR room_id LIKE CONCAT('%', :userId, '%')", nativeQuery = true)
    List<String> findDistinctRoomIdsByUserId(@Param("userId") String userId);
}

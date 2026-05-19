package com.anteiku.backend.webrtc.service;

import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.JoinOrCreateVoiceRoomDto;
import com.anteiku.backend.model.JoinOrCreateVoiceRoomResponseDto;
import com.anteiku.backend.notification.service.NotificationService;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VoiceService {
    private final NotificationService notificationService;
    private HashMap<UUID, HashSet<UUID>> roomSessions = new HashMap<>();

    private UUID createVoiceRoom(UUID userId) {
        UUID newRoomId = UUID.randomUUID();

        HashSet<UUID> participantIds = new HashSet<>();
        participantIds.add(userId);

        roomSessions.put(newRoomId, participantIds);
        return newRoomId;
    }

    private HashSet<UUID> getReferencedRoomParticipants(UUID roomId) {
        HashSet<UUID> participants = roomSessions.get(roomId);
        if (participants == null) {
            throw new ResourceNotFoundException("Room with id " + roomId + " not found");
        }

        return roomSessions.get(roomId);
    }

    public HashSet<UUID> getRoomParticipants(UUID roomId) {
        return new HashSet<>(getReferencedRoomParticipants(roomId));
    }

    public void inviteUsersToVoiceRoom(UUID roomId, List<UUID> userIds) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!roomSessions.containsKey(roomId)) {
            throw new ResourceNotFoundException("Room with id " + roomId + " not found");
        }

        for (UUID id : userIds) {
            notificationService.sendCallNotification(roomId, userId, id);
        }
    }

    public JoinOrCreateVoiceRoomResponseDto joinOrCreateVoiceRoom(JoinOrCreateVoiceRoomDto dto) {
        UUID userId = SecurityUtils.getCurrentUserId();
        JoinOrCreateVoiceRoomResponseDto response = new JoinOrCreateVoiceRoomResponseDto();

        if (dto.getRoomId() == null) {
            UUID newRoomId = createVoiceRoom(userId);
            response.setRoomId(newRoomId);
        } else {
            UUID roomId = dto.getRoomId();

            HashSet<UUID> participants = getReferencedRoomParticipants(roomId);
            participants.add(userId);

            response.setRoomId(roomId);
        }

        return response;
    }
}
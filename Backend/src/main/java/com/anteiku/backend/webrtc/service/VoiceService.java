package com.anteiku.backend.webrtc.service;

import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.JoinOrCreateVoiceRoomDto;
import com.anteiku.backend.model.JoinOrCreateVoiceRoomResponseDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.notification.service.NotificationService;
import com.anteiku.backend.service.UserService;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class VoiceService {
    private final NotificationService notificationService;
    private final UserService userService;

    private final Map<UUID, Map<UUID, UserPublicDto>> roomSessions = new ConcurrentHashMap<>();

    public List<UserPublicDto> getRoomParticipants(UUID roomId) {
        Map<UUID, UserPublicDto> participants = roomSessions.get(roomId);
        if (participants == null) {
            return Collections.emptyList();
        }
        return new ArrayList<>(participants.values());
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
        UserPublicDto userPublicDto = userService.getUserById(userId);
        JoinOrCreateVoiceRoomResponseDto response = new JoinOrCreateVoiceRoomResponseDto();

        UUID roomId = dto.getRoomId();
        if (roomId == null) {
            roomId = UUID.randomUUID();
        }

        Map<UUID, UserPublicDto> participants = roomSessions.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>());
        participants.put(userId, userPublicDto);

        response.setRoomId(roomId);
        return response;
    }

    public void removeUserFromVoiceRoom(UUID roomId, UUID userId) {
        Map<UUID, UserPublicDto> participants = roomSessions.get(roomId);

        if (participants != null) {
            participants.remove(userId);

            if (participants.isEmpty()) {
                roomSessions.remove(roomId);
            }
        }
    }
}
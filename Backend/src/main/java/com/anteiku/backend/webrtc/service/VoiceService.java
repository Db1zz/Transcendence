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

@Service
@RequiredArgsConstructor
public class VoiceService {
    private final NotificationService notificationService;
    private final UserService userService;
    private HashMap<UUID, List<UserPublicDto>> roomSessions = new HashMap<>();

    private UUID createVoiceRoom(UserPublicDto userPublicDto) {
        UUID newRoomId = UUID.randomUUID();

        List<UserPublicDto> participants = new ArrayList<>();
        participants.add(userPublicDto);

        roomSessions.put(newRoomId, participants);
        return newRoomId;
    }

    private List<UserPublicDto> getReferencedRoomParticipants(UUID roomId) {
        List<UserPublicDto> participants = roomSessions.get(roomId);
        if (participants == null) {
            throw new ResourceNotFoundException("Room with id " + roomId + " not found");
        }

        return participants;
    }

    public List<UserPublicDto> getRoomParticipants(UUID roomId) {
        return Collections.unmodifiableList(roomSessions.get(roomId));
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

        if (dto.getRoomId() == null) {
            UUID newRoomId = createVoiceRoom(userPublicDto);
            response.setRoomId(newRoomId);
        } else {
            UUID roomId = dto.getRoomId();

            List<UserPublicDto> participants = getReferencedRoomParticipants(roomId);
            participants.add(userPublicDto);

            response.setRoomId(roomId);
        }

        return response;
    }
}
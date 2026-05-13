package com.anteiku.backend.service;

import com.anteiku.backend.model.JoinOrCreateVoiceRoomDto;
import com.anteiku.backend.model.JoinOrCreateVoiceRoomResponseDto;
import com.anteiku.backend.notification.service.NotificationService;
import com.anteiku.backend.util.TempVoiceRoomDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoiceService {
    private final NotificationService notificationService;

    HashMap<UUID, TempVoiceRoomDto> rooms = new HashMap<>();

    private UUID createVoiceRoom(JoinOrCreateVoiceRoomDto dto) {
        UUID newRoomId = UUID.randomUUID();
        TempVoiceRoomDto tempVoiceRoomDto = new TempVoiceRoomDto();
        tempVoiceRoomDto.setCreatorId(dto.getCallerId());
        rooms.put(newRoomId, tempVoiceRoomDto);

        return newRoomId;
    }

    public void inviteUsersToVoiceRoom(UUID roomId, UUID callerId, List<UUID> userIds) {
        for (UUID id : userIds) {
             notificationService.sendCallNotification(roomId, callerId, id);
        }
    }

    public JoinOrCreateVoiceRoomResponseDto joinOrCreateVoiceRoom(JoinOrCreateVoiceRoomDto dto) {
        JoinOrCreateVoiceRoomResponseDto response = new JoinOrCreateVoiceRoomResponseDto();

        if (dto.getRoomId() == null) {
            UUID newRoomId = createVoiceRoom(dto);
            response.setRoomId(newRoomId);
        } else {
            response.setRoomId(dto.getRoomId());
        }

        if (dto.getInvitedUsers() != null) {
            inviteUsersToVoiceRoom(response.getRoomId(), dto.getCallerId(), dto.getInvitedUsers());
        }

        return response;
    }
}
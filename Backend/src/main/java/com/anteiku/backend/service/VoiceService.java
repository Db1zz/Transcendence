package com.anteiku.backend.service;

import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateVoiceRoomDto;
import com.anteiku.backend.model.CreateVoiceRoomResponseDto;
import com.anteiku.backend.util.TempVoiceRoomDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoiceService {
    HashMap<UUID, TempVoiceRoomDto> rooms = new HashMap<>();

    public CreateVoiceRoomResponseDto createVoiceRoom(CreateVoiceRoomDto dto) {
        UUID newRoomId = UUID.randomUUID();
        TempVoiceRoomDto tempVoiceRoomDto = new TempVoiceRoomDto();

        tempVoiceRoomDto.setCreatorId(dto.getCreatorId());
        rooms.put(newRoomId, tempVoiceRoomDto);

        CreateVoiceRoomResponseDto createVoiceRoomResponseDto = new CreateVoiceRoomResponseDto();
        createVoiceRoomResponseDto.setRoomId(newRoomId);

        return createVoiceRoomResponseDto;
    }

    public TempVoiceRoomDto getVoiceRoom(UUID roomId) {
        TempVoiceRoomDto result = rooms.get(roomId);
        if (result == null) {
            throw new ResourceNotFoundException("Room with id: '" + roomId + "' was not found.");
        }

        return result;
    }
}
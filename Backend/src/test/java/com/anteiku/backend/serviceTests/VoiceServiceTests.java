package com.anteiku.backend.serviceTests;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateVoiceRoomDto;
import com.anteiku.backend.model.CreateVoiceRoomResponseDto;
import com.anteiku.backend.service.VoiceService;
import com.anteiku.backend.util.TempVoiceRoomDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class VoiceServiceTests {
    @InjectMocks
    private VoiceService voiceService;

    @Test
    void createVoiceRoomSuccessTest() {
        UUID id  = UUID.randomUUID();
        CreateVoiceRoomDto createVoiceRoomDto = new CreateVoiceRoomDto();
        createVoiceRoomDto.setCreatorId(id);

        CreateVoiceRoomResponseDto createVoiceRoomResponseDto = voiceService.createVoiceRoom(createVoiceRoomDto);

        assertNotNull(createVoiceRoomResponseDto);
        assertNotNull(createVoiceRoomResponseDto.getRoomId());

        TempVoiceRoomDto tempVoiceRoomDto = voiceService.getVoiceRoom(createVoiceRoomResponseDto.getRoomId());
        assertNotNull(tempVoiceRoomDto);
        assertEquals(tempVoiceRoomDto.getCreatorId(), createVoiceRoomDto.getCreatorId());
    }

    @Test
    void getVoiceRoomNotFoundTest() {
        UUID id = UUID.randomUUID();

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> voiceService.getVoiceRoom(id));
        assertEquals("Room with id: '" + id + "' was not found.", exception.getMessage());
    }
}

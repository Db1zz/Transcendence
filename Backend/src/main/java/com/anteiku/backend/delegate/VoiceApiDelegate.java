package com.anteiku.backend.delegate;

import com.anteiku.backend.api.VoiceApi;
import com.anteiku.backend.model.CreateVoiceRoomDto;
import com.anteiku.backend.model.CreateVoiceRoomResponseDto;
import com.anteiku.backend.service.VoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api")
@RestController
@RequiredArgsConstructor
public class VoiceApiDelegate implements VoiceApi {
    private final VoiceService voiceService;

    @Override
    public ResponseEntity<CreateVoiceRoomResponseDto> createVoiceRoom(CreateVoiceRoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(voiceService.createVoiceRoom(dto));
    }
}

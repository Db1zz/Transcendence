package com.anteiku.backend.delegate;

import com.anteiku.backend.api.ChannelsApi;
import com.anteiku.backend.model.ChannelDto;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.service.ChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChannelsApiDelegate implements ChannelsApi {
    private final ChannelService channelService;

    @Override
    public ResponseEntity<ChannelDto> createChannel(CreateChannelDto createChannelDto) {
        ChannelDto channelDto = channelService.createChannel(createChannelDto);
        return ResponseEntity.status(201).body(channelDto);
    }

    @Override
    public ResponseEntity<Void> deleteChannel(UUID channelId) {
        channelService.deleteChannel(channelId);
        return ResponseEntity.status(204).body(null);
    }
}
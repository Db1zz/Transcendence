package com.anteiku.backend.delegate;

import com.anteiku.backend.api.ChannelsApi;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.model.CreateChannelResponseDto;
import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.model.UpdateChannelDto;
import com.anteiku.backend.service.ChannelService;
import com.anteiku.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChannelsApiDelegate implements ChannelsApi {
    private final ChannelService channelService;
    private final ChatService chatService;

    @Override
    public ResponseEntity<CreateChannelResponseDto> createChannel(CreateChannelDto createChannelDto) {
        com.anteiku.backend.entity.ChannelType dbType = com.anteiku.backend.entity.ChannelType.TEXT;
        if (createChannelDto.getChannelType() != null && createChannelDto.getChannelType().name().equals("VOICE")) {
            dbType = com.anteiku.backend.entity.ChannelType.VOICE;
        }

        String defaultName = dbType == com.anteiku.backend.entity.ChannelType.VOICE ? "Voice Room" : "DM";
        String channelName = createChannelDto.getName() != null ? createChannelDto.getName() : defaultName;

        UUID channelId = chatService.createChannel(
                channelName,
                dbType,
                createChannelDto.getOrganizationId(),
                createChannelDto.getMemberIds()
        );

        CreateChannelResponseDto response = new CreateChannelResponseDto();
        response.setId(channelId);
        response.setName(channelName);
        if (createChannelDto.getChannelType() != null) {
            response.setChannelType(CreateChannelResponseDto.ChannelTypeEnum.valueOf(createChannelDto.getChannelType().name()));
        } else {
            response.setChannelType(CreateChannelResponseDto.ChannelTypeEnum.TEXT);
        }
        response.setCreatedAt(OffsetDateTime.now());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<Void> deleteChannel(UUID channelId) {
        channelService.deleteChannel(channelId);
        return ResponseEntity.status(204).body(null);
    }

    @Override
    public ResponseEntity<ServerChannelDto> updateChannel(UUID id, UpdateChannelDto updateChannelDto) {
        return ResponseEntity.ok(channelService.updateChannel(id, updateChannelDto));
    }
}
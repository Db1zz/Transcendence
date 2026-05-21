package com.anteiku.backend.stomp.controller;

import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.service.OrganizationService;
import com.anteiku.backend.webrtc.service.VoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class OrganizationMessageController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final OrganizationService organizationService;
    private final VoiceService voiceService;

    @MessageMapping("/organization/{organizationId}/sync")
    public void handleSyncRequest(@DestinationVariable UUID organizationId, Principal principal) {
        log.info("Sync requested by user {} for organization {}", principal.getName(), organizationId);

        List<ServerChannelDto> channels = organizationService.getOrganizationVoiceChannels(organizationId);
        List<Map<String, Object>> activeChannels = new ArrayList<>();

        for (ServerChannelDto channel : channels) {
            if (!channel.getType().equals(ServerChannelDto.TypeEnum.VOICE)) {
                continue;
            }

            List<UserPublicDto> participants = voiceService.getRoomParticipants(channel.getId());
            if (participants == null || participants.isEmpty()) {
                continue;
            }

            Map<String, Object> channelData = new HashMap<>();
            channelData.put("channelId", channel.getId());
            channelData.put("participants", participants != null ? participants : Collections.emptyList());

            activeChannels.add(channelData);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SYNC_STATE");
        payload.put("organizationId", organizationId);
        payload.put("channels", activeChannels);

        simpMessagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/sync",
                payload
        );
    }

    @MessageMapping("/organization/{organizationId}")
    public void handleGlobalSendRequest(@DestinationVariable UUID organizationId, Message<?> message, Principal principal) {
        simpMessagingTemplate.send(
                "/topic/organization/" + organizationId,
                message
        );
    }

    @MessageMapping("/organization/{organizationId}/voice/{voiceId}/leave")
    public void handleVoiceLeave(
            @DestinationVariable UUID organizationId,
            @DestinationVariable UUID voiceId,
            Message<?> message,
            Principal principal
    ) {
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) principal;

        UUID userId = (UUID) auth.getPrincipal();

        voiceService.removeUserFromVoiceRoom(voiceId, userId);
        log.info("User {} left voice room {}", userId, voiceId);

        simpMessagingTemplate.send(
                "/topic/organization/" + organizationId,
                message
        );
    }
}

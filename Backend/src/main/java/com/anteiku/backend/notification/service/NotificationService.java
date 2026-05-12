package com.anteiku.backend.notification.service;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.ChannelMemberEntity;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.UserInfoDto;
import com.anteiku.backend.notification.event.EventType;
import com.anteiku.backend.notification.event.EventScope;
import com.anteiku.backend.notification.event.NotificationEvent;
import com.anteiku.backend.notification.kafka.producer.NotificationProducer;
import com.anteiku.backend.notification.payload.DmChannelPayload;
import com.anteiku.backend.security.jwt.JwtService;
import com.anteiku.backend.service.ChannelService;
import com.anteiku.backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class NotificationService {
    private final NotificationProducer notificationProducer;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final UserService userService;
    private final ChannelService channelService;

    public String generateNotificationToken() throws UserIsNotAuthorized {
        UserInfoDto userInfoDto = userService.getMe();;
        return jwtService.generateToken(userInfoDto.getEmail(), userInfoDto.getId());
    }

    public void sendMessageNotification(ChatMessageResponse chatMessageResponse) {
        UUID channelId = chatMessageResponse.getChannelId();
        ChannelEntity channel = channelService.getChannel(channelId);
        List<ChannelMemberEntity> channelMembers = channelService.getChannelMembers(channelId);

        if (channel.getOrganization() != null) {
            sendToOrganizationChannel(channel, channelMembers);
        } else if (channel.getName().equals("DM")) {
            sendToDm(chatMessageResponse, channel, channelMembers);
        } else {
            sendToGroupChannel(channel, channelMembers);
        }
    }

    private void sendToDm(ChatMessageResponse chatMessageResponse, ChannelEntity channel, List<ChannelMemberEntity> channelMembers) {
        UUID senderId = chatMessageResponse.getSenderId();

        ChannelMemberEntity receiver = channelMembers.stream()
                .filter(member -> !member.getUser().getId().equals(senderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No receiver member found for a DM chat"));

        DmChannelPayload payload = new DmChannelPayload(
                receiver.getUser().getId().toString(),
                senderId.toString(),
                channel.getId().toString(),
                chatMessageResponse.getContent(),
                Instant.now().getEpochSecond()
        );

        // System.out.println("senderId " + senderId + " receiverId " + receiver.getUser().getId());

        NotificationEvent notificationEvent = new NotificationEvent(
                EventType.MESSAGE_CREATED,
                EventScope.DM,
                payload
        );

        String json = objectMapper.writeValueAsString(notificationEvent);
        notificationProducer.send(json);
    }

    private void sendToOrganizationChannel(ChannelEntity channelEntity, List<ChannelMemberEntity> channelMembers) {
        // TODO
    }

    private void sendToGroupChannel(ChannelEntity channelEntity, List<ChannelMemberEntity> channelMembers) {
        // Maybe TODO
    }
}

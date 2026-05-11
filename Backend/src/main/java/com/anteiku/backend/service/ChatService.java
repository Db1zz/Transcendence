package com.anteiku.backend.service;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.model.ChatChannelDto;
import com.anteiku.backend.model.ChatMessageRequest;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public ChatMessageResponse save(ChatMessageRequest request) {
        ChannelEntity channelProxy = channelRepository.getReferenceById(request.getChannelId());
        UserEntity senderProxy = userRepository.getReferenceById(request.getSenderId());

        ChatMessageEntity entity = ChatMessageEntity.builder()
                .channel(channelProxy)
                .sender(senderProxy)
                .content(request.getContent())
                .build();

        ChatMessageEntity saved = chatMessageRepository.save(entity);
        log.info("Successfully saved message [{}] in channelId: {}", saved.getId(), saved.getChannel().getId());

        return mapToResponse(saved);
    }

    private ChatMessageResponse mapToResponse(ChatMessageEntity entity) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(entity.getId());

        if (entity.getChannel() != null) {
            response.setChannelId(entity.getChannel().getId());
        }
        if (entity.getSender() != null) {
            response.setSenderId(entity.getSender().getId());
        }

        response.setContent(entity.getContent());

        if (entity.getCreatedAt() != null) {
            response.setCreatedAt(entity.getCreatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime());
        }

        return response;
    }

    public List<ChatMessageResponse> getMessagesPaginated(UUID channelId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size,  Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ChatMessageEntity> entitiesPage = chatMessageRepository.findByChannel_IdOrderByCreatedAtDesc(channelId, pageRequest);

        log.info("Retrieved {} messages from channelId: {}", entitiesPage.getNumberOfElements(), channelId.toString());

        return entitiesPage.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ChatChannelDto> getUserChatRooms(UUID userId) {
        log.info("Fetching text channels/DMs for userId: {}", userId);
        return channelRepository.findUserTextChannels(userId).stream()
                .map(projection -> {
                    ChatChannelDto dto = new ChatChannelDto();
                    dto.setChannelId(projection.getChannelId());
                    dto.setOtherUserId(projection.getOtherUserId());
                    dto.setOtherUserName(projection.getOtherUserName());
                    dto.setOtherUserPicture(projection.getOtherUserPicture());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public UUID createChannel(String name, ChannelType type, UUID organizationId, List<UUID> memberIds) {

        if (type == ChannelType.TEXT && organizationId == null && memberIds != null && memberIds.size() == 2) {
            UUID existingChannelId  = channelRepository.findPrivateChannel(memberIds.get(0), memberIds.get(1));
            if (existingChannelId != null) {
                log.info("Found existing private TEXT channel with id [{}] returning existing channel.", existingChannelId);
                return existingChannelId;
            }
        }

        OrganizationEntity organizationProxy = null;
        if (organizationId != null) {
            organizationProxy = organizationRepository.getReferenceById(organizationId);
        }

        ChannelEntity channel = ChannelEntity.builder()
                .name(name)
                .type(type)
                .organization(organizationProxy)
                .build();

        ChannelEntity savedChannel = channelRepository.save(channel);
        log.info("Successfully created new {} channel with ID: [{}]", type.name(), savedChannel.getId());

        if (memberIds != null && !memberIds.isEmpty()) {
            for (UUID userId : memberIds) {
                UserEntity userProxy = userRepository.getReferenceById(userId);
                ChannelMemberEntity member = ChannelMemberEntity.builder()
                        .channel(savedChannel)
                        .user(userProxy)
                        .build();
                channelMemberRepository.save(member);
            }
            log.info("Successfully added all members to channel [{}]", savedChannel.getId());
        }

        return savedChannel.getId();
    }
}

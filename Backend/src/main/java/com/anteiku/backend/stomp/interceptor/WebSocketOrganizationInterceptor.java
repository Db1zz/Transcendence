package com.anteiku.backend.stomp.interceptor;

import com.anteiku.backend.service.OrganizationMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketOrganizationInterceptor implements ChannelInterceptor {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private final OrganizationMemberService organizationMemberService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        String destination = accessor.getDestination();
        if (StompCommand.SEND.equals(command) && destination.startsWith("/topic/")) {
            throw new IllegalArgumentException("Clients cannot send directly to topics. Send to /app instead.");
        }

        if (StompCommand.SUBSCRIBE.equals(command) || StompCommand.SEND.equals(command)) {
            if (destination == null) {
                return message;
            }

            boolean isOrgTopic = PATH_MATCHER.match("/topic/organization/*", destination);
            boolean isOrgApp = PATH_MATCHER.match("/app/organization/*", destination);
            if (!isOrgTopic && !isOrgApp) {
                return message;
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) accessor.getUser();

            UUID organizationId = extractOrganizationId(destination);
            UUID userId = (UUID) authToken.getPrincipal();

            boolean isMember = organizationMemberService.isUserMemberOfOrganization(userId, organizationId);
            if (!isMember) {
                log.warn("WS Security Violation: User [{}] denied access to Organization [{}]", userId, organizationId);
                throw new IllegalArgumentException("Unauthorized: You are not a member of this organization server");
            }

            log.debug("WS Access Approved: User [{}] for destination [{}]", userId, destination);
        }

        return message;
    }

    private UUID extractOrganizationId(String destination) {
        String[] split = destination.split("/");
        try {
            // /topic/organization/123 < 3
            return UUID.fromString(split[3]);
        } catch (Exception e) {
            log.error("Failed to parse organization UUID from destination: {}", destination);
            throw new IllegalArgumentException("Invalid destination format");
        }
    }
}

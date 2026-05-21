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
public class StompOrganizationInterceptor implements ChannelInterceptor {
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

        if (StompCommand.SEND.equals(command) && destination != null && destination.startsWith("/topic/")) {
            log.warn("Blocked direct client send to topic: {}", destination);
            return null;
        }

        if (StompCommand.SUBSCRIBE.equals(command) || StompCommand.SEND.equals(command)) {
            if (destination == null) {
                return message;
            }

            boolean isOrgTopic = PATH_MATCHER.match("/topic/organization/**", destination);
            boolean isOrgApp = PATH_MATCHER.match("/app/organization/**", destination);
            if (!isOrgTopic && !isOrgApp) {
                return message;
            }

            if (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken)) {
                log.error("WS Security Violation: Unauthenticated access attempt to {}", destination);
                return null;
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) accessor.getUser();

            UUID organizationId = extractOrganizationId(destination);
            if (organizationId == null) {
                return null;
            }

            UUID userId = (UUID) authToken.getPrincipal();

            boolean isMember = organizationMemberService.isUserMemberOfOrganization(userId, organizationId);
            if (!isMember) {
                log.warn("WS Security Violation: User [{}] denied access to Organization [{}]", userId, organizationId);
                return null;
            }

            log.debug("WS Access Approved: User [{}] for destination [{}]", userId, destination);
        }

        return message;
    }

    private UUID extractOrganizationId(String destination) {
        try {
            String[] split = destination.split("/");
            if (split.length < 4) {
                return null;
            }
            return UUID.fromString(split[3]);
        } catch (Exception e) {
            log.error("Failed to parse organization UUID from destination: {}", destination);
            return null;
        }
    }
}
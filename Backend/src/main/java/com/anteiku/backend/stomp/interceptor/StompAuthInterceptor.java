package com.anteiku.backend.stomp.interceptor;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.security.jwt.JwtService;
import com.anteiku.backend.security.session.UserSessionsService;
import com.anteiku.backend.service.UserService;
import com.anteiku.backend.stomp.service.StompSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompAuthInterceptor implements ChannelInterceptor {
    private final StompSessionService stompSessionService;
    private final JwtService jwtService;
    private final UserSessionsService sessionService;
    private final UserService userService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            String token = null;

            if (sessionAttributes != null) {
                token = (String) sessionAttributes.get(TokenNames.ACCESS_TOKEN);
            }

            if (token != null) {
                if (!jwtService.isTokenValid(token) || sessionService.isSessionLoggedOut(token)) {
                    log.warn("WS Cookie Auth Failed: Token is invalid or logged out");
                    throw new IllegalArgumentException("Unauthorized: Invalid cookie token");
                }

                String userEmail = jwtService.extractUserEmail(token);

                if (userEmail != null) {
                    UserPublicDto userPublicDto = userService.getUserByEmail(userEmail);
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userPublicDto.getRole());

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userPublicDto.getId(),
                            null,
                            Collections.singleton(authority)
                    );
                    accessor.setUser(authToken);
                    stompSessionService.addSession(accessor.getSessionId(), userPublicDto.getId());
                    log.info("WS User [{}] successfully authenticated via Cookie", userEmail);
                }
            } else {
                log.warn("WS Connection rejected: No auth cookie found in handshake");
                throw new IllegalArgumentException("Unauthorized: Missing auth cookie");
            }
        }

        return message;
    }
}
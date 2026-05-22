package com.anteiku.backend.stomp.config;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.stomp.interceptor.StompAuthInterceptor;
import com.anteiku.backend.stomp.interceptor.StompOrganizationInterceptor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final StompAuthInterceptor authInterceptor;
    private final StompOrganizationInterceptor organizationInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws", "/ws/")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

                        if (request instanceof ServletServerHttpRequest servletRequest) {
                            HttpServletRequest httpRequest = servletRequest.getServletRequest();
                            Cookie[] cookies = httpRequest.getCookies();

                            if (cookies != null) {
                                for (Cookie cookie : cookies) {
                                    if (cookie.getName().equals(TokenNames.ACCESS_TOKEN)) {
                                        attributes.put(TokenNames.ACCESS_TOKEN, cookie.getValue());
                                        break;
                                    }
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {}
                });
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(
                authInterceptor,
                organizationInterceptor
        );
    }
}
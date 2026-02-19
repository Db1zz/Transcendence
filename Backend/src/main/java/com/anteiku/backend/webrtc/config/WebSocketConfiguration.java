package com.anteiku.backend.webrtc.config;

import com.anteiku.backend.service.VoiceService;
import com.anteiku.backend.webrtc.handler.SocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfiguration implements WebSocketConfigurer {
    private final VoiceService voiceService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SocketHandler(voiceService), "/socket")
                .setAllowedOrigins("*");
    }
}

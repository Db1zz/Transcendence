package com.anteiku.backend.webrtc.handler;

import com.anteiku.backend.service.VoiceService;
import com.anteiku.backend.util.QueryUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {
    private final VoiceService voiceService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    HashMap<UUID, List<WebSocketSession>> sessions = new HashMap();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
        throws InterruptedException, IOException {
        String query = session.getUri().getQuery();
        UUID roomId = UUID.fromString(QueryUtils.getQueryParameter(query, "roomId"));

        List<WebSocketSession> room_sessions = sessions.get(roomId);

        for (WebSocketSession room_session : room_sessions) {
            synchronized (room_session) {
                if (room_session.isOpen() && !session.getId().equals(room_session.getId())) {
                    room_session.sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        WebSocketSession wrapped = new ConcurrentWebSocketSessionDecorator(session, 10000, 1024);

        String query = session.getUri().getQuery();
        UUID roomId = UUID.fromString(QueryUtils.getQueryParameter(query, "roomId"));

        List<WebSocketSession> room_sessions = sessions.get(roomId);
        if (room_sessions == null) {
            room_sessions = new ArrayList();
        }
        room_sessions.add(session);

        sessions.put(roomId, room_sessions);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws  Exception {
        sessions.remove(session);
    }
}

package com.anteiku.backend.webrtc.handler;

import com.anteiku.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
        throws InterruptedException, IOException {
        String jsonMessage = message.getPayload();

        JsonNode root = objectMapper.readTree(jsonMessage);
        ObjectNode objectNode = (ObjectNode) root;
        String xd = objectNode.get("to").asString();
        objectNode.put("from", session.getId());

        WebSocketSession receiver = sessions.get(xd);
        if (receiver == null) {
            throw new ResourceNotFoundException("WebRtc Session not found");
        }

        synchronized (receiver) {
            receiver.sendMessage(new TextMessage(root.toString())); // TODO try/catch block
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebRTC connection established: Session ID {}",  session.getId());
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "new-connection");
        root.put("from", session.getId());

        String jsonMessage = objectMapper.writeValueAsString(root);

        TextMessage textMessage = new TextMessage(jsonMessage);

        sessions.put(session.getId(), session);

        sessions.forEach(((uuid, webSocketSession) -> {
            if (!session.getId().equals(uuid)) {
                try {
                    synchronized (webSocketSession) {
                        webSocketSession.sendMessage(textMessage);
                    }
                } catch (IOException e) {
                    System.out.println("Unable to send a message to a websocket: " + e.getMessage());
                }
            }
        }));
        System.out.println("Number of users in a room: " + sessions.size());
        log.info("Active WebRTC sessions: {}", sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws  Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "user-disconnection");
        root.put("from", session.getId());

        String jsonMessage = objectMapper.writeValueAsString(root);

        TextMessage textMessage = new TextMessage(jsonMessage);

        synchronized (sessions){
            sessions.remove(session.getId());
        }

        sessions.forEach((uuid,  webSocketSession) -> {
            try {
                synchronized (webSocketSession) {
                    webSocketSession.sendMessage(textMessage);
                }
            } catch (IOException e) {
                System.out.println("Unable to send a message to a websocket: " + e.getMessage());
            }
        });
        log.info("WebRTC connection closed: Session ID {} with status {}", session.getId(), closeStatus);
    }
}

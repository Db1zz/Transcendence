package com.anteiku.backend.webrtc.handler;

import com.anteiku.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
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

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    HashMap<String, WebSocketSession> sessions = new HashMap();

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

        receiver.sendMessage(new TextMessage(root.toString())); // TODO try/catch block
    }

    /* A new-connection[from: A] -> B offer[to: A] -> server[B offer[from: B, to: A]] -> A answer[to: B] -> server[A answer[from: A, to: B]] -> B ok. */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "new-connection");
        root.put("from", session.getId());

        String jsonMessage = objectMapper.writeValueAsString(root);

        TextMessage textMessage = new TextMessage(jsonMessage);

        sessions.put(session.getId(), session);

        sessions.forEach(((uuid, webSocketSession) -> {
            if (!session.getId().equals(uuid)) {
                try {
                    webSocketSession.sendMessage(textMessage);
                } catch (IOException e) {
                    System.out.println("Unable to send a message to a websocket: " + e.getMessage());
                }
            }
        }));
        System.out.println("Number of users in a room: " + sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws  Exception {
        // TODO remove from DB as well, if the connection counter is === to 1
        sessions.remove(session.getId());
    }
}

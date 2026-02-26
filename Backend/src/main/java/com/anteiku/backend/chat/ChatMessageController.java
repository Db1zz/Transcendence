package com.anteiku.backend.chat;

import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.ChatRoomDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.security.jwt.JwtUtils;
import com.anteiku.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final HttpServletRequest request;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessageResponse> getRoomMessages(@PathVariable String roomId) {
        return chatMessageService.lastMessages(roomId);
    }
    
    @GetMapping("/rooms")
    public List<ChatRoomDto> getUserChatRooms() {
        UUID userId = getCurrentUserId();
        return chatMessageService.getUserChatRooms(userId);
    }
    
    private UUID getCurrentUserId() {
        String email = jwtUtils.getCurrentUserEmail()
                .orElseThrow(() -> new UserIsNotAuthorized("User is not authorized"));
        UserPublicDto user = userService.getUserByEmail(email);
        return user.getId();
    }
}

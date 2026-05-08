package com.anteiku.backend.delegate;

import com.anteiku.backend.api.ChatApi;
import com.anteiku.backend.service.ChatService;
import com.anteiku.backend.model.ChatMessageResponse;
import com.anteiku.backend.model.ChatChannelDto;
import com.anteiku.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatApiDelegate implements ChatApi {
    private final ChatService chatService;

    @Override
    public ResponseEntity<List<ChatMessageResponse>> getChannelMessages(UUID channelId, Integer page, Integer size) {
        int pageNum = page != null ? page : 0;
        int sizeNum = size != null ? size : 50;
        return ResponseEntity.ok().body(chatService.getMessagesPaginated(channelId, pageNum, sizeNum));
    }
    
    @Override
    public ResponseEntity<List<ChatChannelDto>> getUserChannels() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok().body(chatService.getUserChatRooms(userId));
    }
}

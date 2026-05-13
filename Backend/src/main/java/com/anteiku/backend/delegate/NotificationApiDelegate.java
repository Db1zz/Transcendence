package com.anteiku.backend.delegate;

import com.anteiku.backend.api.NotificationApi;
import com.anteiku.backend.model.NotificationTokenResponseDto;
import com.anteiku.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationApiDelegate implements NotificationApi {
    private final NotificationService notificationService;

    @Override
    public ResponseEntity<NotificationTokenResponseDto> getNotificationToken() {
        String token = notificationService.generateNotificationToken();
        NotificationTokenResponseDto response = new NotificationTokenResponseDto();
        response.setToken(token);
        response.setExpiresAt(System.currentTimeMillis() + 86400000);
        response.setTokenType("Bearer");
        return ResponseEntity.ok(response);
    }
}

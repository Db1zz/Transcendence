package com.anteiku.backend.notification.event;

import com.anteiku.backend.notification.payload.NotificationPayload;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter @Setter
public class NotificationEvent {
    EventType type;
    EventScope scope;
    NotificationPayload payload;
}

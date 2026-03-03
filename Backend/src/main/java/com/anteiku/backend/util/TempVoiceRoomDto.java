package com.anteiku.backend.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.UUID;

@Getter @Setter
@RequiredArgsConstructor
public class TempVoiceRoomDto {
    private UUID creatorId;
    private ArrayList<UUID> invitedUsers;
    private ArrayList<UUID> connectedUsers;
}

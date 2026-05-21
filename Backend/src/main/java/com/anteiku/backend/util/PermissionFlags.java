package com.anteiku.backend.util;

public class PermissionFlags {
    public static final Long ADMINISTRATOR = 1L;
    public static final Long MANAGE_CHANNELS = 1L << 1;
    public static final Long MANAGE_ROLES = 1L << 2;
    public static final Long SEND_MESSAGES = 1L << 3;
    public static final Long CONNECT_VOICE = 1L << 4;

    public static boolean hasPermission(Long bitmask, Long permissionMask) {
        if ((bitmask & ADMINISTRATOR) == ADMINISTRATOR) {
            return true;
        }
        return (bitmask & permissionMask) == permissionMask;
    }
}

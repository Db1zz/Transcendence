package com.anteiku.backend.util;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {
    public static UUID getCurrentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}

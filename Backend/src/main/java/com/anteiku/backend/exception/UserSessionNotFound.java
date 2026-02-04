package com.anteiku.backend.exception;

public class UserSessionNotFound extends RuntimeException {
    public UserSessionNotFound(String message) {
        super(message);
    }
}

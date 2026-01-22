package com.anteiku.backend.exception;

public class UserIsNotAuthorized extends RuntimeException {
    public UserIsNotAuthorized(String message) {
        super(message);
    }
}

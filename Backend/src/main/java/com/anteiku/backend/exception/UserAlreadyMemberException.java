package com.anteiku.backend.exception;

public class UserAlreadyMemberException extends RuntimeException {
    public UserAlreadyMemberException(String message) {
        super(message);
    }
}

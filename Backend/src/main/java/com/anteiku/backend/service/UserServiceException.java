package com.anteiku.backend.service;

public class UserServiceException extends RuntimeException {
    public UserServiceException(String reason) {
        super(reason);
    }
}

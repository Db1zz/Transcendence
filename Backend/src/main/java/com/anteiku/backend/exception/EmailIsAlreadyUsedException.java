package com.anteiku.backend.exception;

public class EmailIsAlreadyUsedException extends RuntimeException {
    public EmailIsAlreadyUsedException(String message) {
        super(message);
    }
}

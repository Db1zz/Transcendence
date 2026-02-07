package com.anteiku.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({EmailIsAlreadyUsedException.class, IllegalArgumentException.class})
    public ResponseEntity<Object> handleBadRequest(RuntimeException e) {
        Map<String, String> body = new HashMap<>();
        body.put("error", e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(RuntimeException e) {
        e.printStackTrace();
        Map<String, String> body = new HashMap<>();
        body.put("error", e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

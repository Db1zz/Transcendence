package com.anteiku.backend.service;

import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    public UserAuthResponseDto authenticateUser(UserAuthDto userAuthDto);
}
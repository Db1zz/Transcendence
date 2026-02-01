package com.anteiku.backend.service;

import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserAuthTokensDto;

public interface AuthService {
    UserAuthResponseDto authenticateUser(UserAuthDto userAuthDto);
    UserAuthTokensDto refreshAuthTokens(String refreshToken);
}
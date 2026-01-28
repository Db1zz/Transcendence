package com.anteiku.backend.delegate;

import com.anteiku.backend.api.AuthApi;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.security.session.UserSessionsServiceImpl;
import com.anteiku.backend.service.AuthServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthApiDelegateImpl implements AuthApi {
    private final AuthServiceImpl authService;
    private final UserSessionsServiceImpl userSessionsService;

    @Override
    public ResponseEntity<UserAuthResponseDto> authenticateUser(UserAuthDto userAuthDto) {
        try {
            UserAuthResponseDto userAuthResponseDto = authService.authenticateUser(userAuthDto);

            ResponseCookie cookie = ResponseCookie.from("jwt", userAuthResponseDto.getAuthTokens().getAccessToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(3600)
                    .path("/")
                    .build();

            return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userAuthResponseDto);
        }  catch (UserNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND).body(null);
        } catch (InvalidCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @Override
    public ResponseEntity<String> refreshAuthTokens(String refreshToken) {
        try {
            UserAuthTokensDto authTokens = authService.refreshAuthTokens(refreshToken);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", authTokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(Duration.between(OffsetDateTime.now(), authTokens.getRefreshTokenExpiresAt()).toSeconds())
                    .path("/")
                    .build();

            return  ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.SET_COOKIE, cookie.toString()).body(authTokens.getAccessToken());
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}

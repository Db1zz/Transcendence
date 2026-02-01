package com.anteiku.backend.delegate;

import com.anteiku.backend.api.AuthApi;
import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.security.config.SecurityProperties;
import com.anteiku.backend.security.session.UserSessionsServiceImpl;
import com.anteiku.backend.service.AuthServiceImpl;
import com.anteiku.backend.util.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthApiDelegateImpl implements AuthApi {
    private final AuthServiceImpl authService;
    private final UserSessionsServiceImpl userSessionsService;
    private final SecurityProperties securityProperties;

    @Override
    public ResponseEntity<UserAuthResponseDto> authenticateUser(UserAuthDto userAuthDto) {
        try {
            UserAuthResponseDto userAuthResponseDto = authService.authenticateUser(userAuthDto);

            ResponseCookie refreshToken = ResponseCookie.from(TokenNames.REFRESH_TOKEN, userAuthResponseDto.getAuthTokens().getRefreshToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod()).toSeconds())
                    .path("/api/auth/refresh")
                    .build();

            ResponseCookie accessToken = ResponseCookie.from(TokenNames.ACCESS_TOKEN, userAuthResponseDto.getAuthTokens().getAccessToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod()).toSeconds())
                    .path("/")
                    .build();

            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.SET_COOKIE, refreshToken.toString())
                    .header(HttpHeaders.SET_COOKIE, accessToken.toString())
                    .body(userAuthResponseDto);
        }  catch (UserNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND).body(null);
        } catch (InvalidCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @Override
    public ResponseEntity<UserAuthTokensDto> refreshAuthTokens() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attributes.getRequest();

            UserAuthTokensDto authTokens = authService.refreshAuthTokens(CookieUtils.getCookieValue(request, TokenNames.REFRESH_TOKEN));

            ResponseCookie refreshCookie = ResponseCookie.from(TokenNames.REFRESH_TOKEN, authTokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod()).toSeconds())
                    .path("/api/auth/refresh")
                    .build();

            ResponseCookie accessCookie = ResponseCookie.from(TokenNames.ACCESS_TOKEN, authTokens.getAccessToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod()).toSeconds())
                    .path("/")
                    .build();

            return  ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                    .body(authTokens);
        } catch(UserIsNotAuthorized e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}

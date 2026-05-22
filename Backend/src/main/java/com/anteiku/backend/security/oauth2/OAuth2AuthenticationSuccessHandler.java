package com.anteiku.backend.security.oauth2;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.security.config.SecurityProperties;
import com.anteiku.backend.security.session.UserSessionsService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    final private UserSessionsService userSessionsService;
    final private SecurityProperties securityProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        UserSessionDto userSessionDto = userSessionsService.createNewSession(oAuth2User.getAttribute("email"));

        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from(TokenNames.ACCESS_TOKEN, userSessionDto.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod()))
                .sameSite("Lax")
                .build();

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from(TokenNames.REFRESH_TOKEN, userSessionDto.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod()))
                .sameSite("Lax")
                .build();

        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

        response.sendRedirect("https://localhost/");
    }
}
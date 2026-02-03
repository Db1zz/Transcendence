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
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)  throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        UserSessionDto userSessionDto = userSessionsService.createNewSession(oAuth2User.getAttribute("email"));

        Cookie accessCookie = new Cookie(TokenNames.ACCESS_TOKEN, userSessionDto.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setMaxAge((int)Duration.ofDays(securityProperties.getAccessTokenExpirationPeriod()).toSeconds());
        accessCookie.setPath("/");

        Cookie refreshCookie = new Cookie(TokenNames.REFRESH_TOKEN, userSessionDto.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setMaxAge((int)Duration.ofDays(securityProperties.getRefreshTokenExpirationPeriod()).toSeconds());
        refreshCookie.setPath("/api/auth/refresh");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
        response.setStatus(HttpServletResponse.SC_OK);

        final String redirectUri = "http://localhost:3000/";
        response.sendRedirect(redirectUri);
    }
}

package com.anteiku.backend.security.oauth2;

import com.anteiku.backend.security.jwt.JwtServiceImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    final JwtServiceImpl jwtService;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)  throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String userEmail = oAuth2User.getAttribute("email");
        String token = jwtService.generateToken(userEmail);

        Cookie responseCookie = new Cookie("jwt", token);

        response.addCookie(responseCookie);
        response.setStatus(HttpServletResponse.SC_OK);

        final String redirectUri = "http://localhost:3000/";
        response.sendRedirect(redirectUri);
    }
}

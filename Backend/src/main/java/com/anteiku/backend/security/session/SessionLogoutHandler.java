package com.anteiku.backend.security.session;

import com.anteiku.backend.security.jwt.JwtServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;

@RequiredArgsConstructor
public class SessionLogoutHandler implements LogoutHandler {
    final private UserSessionsServiceImpl sessionService;
    final private JwtServiceImpl jwtService;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, @Nullable Authentication authentication) {
        String token = null;

        System.out.println("test1234");

        token = jwtService.extractTokenFromACookies(request.getCookies());
        if (token == null) {
            final String lookupKey = "Bearer ";
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith(lookupKey)) {
                token = authorizationHeader.substring(lookupKey.length());
            }
        }

        if (token == null) {
            return;
        }

        sessionService.logout(token);
        System.out.println("User has been logged out");
    }
}

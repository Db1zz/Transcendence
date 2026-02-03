package com.anteiku.backend.security.session;

import com.anteiku.backend.exception.UserIsNotAuthorized;
import com.anteiku.backend.security.jwt.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;

@RequiredArgsConstructor
public class SessionLogoutHandler implements LogoutHandler {
    final private UserSessionsService sessionService;
    final private JwtService jwtService;

    @Override
    public void logout(@NotNull HttpServletRequest request, HttpServletResponse response, @Nullable Authentication authentication) {
        String token = null;

        token = jwtService.extractTokenFromACookies(request.getCookies());
        if (token == null) {
            final String lookupKey = "Bearer ";
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith(lookupKey)) {
                token = authorizationHeader.substring(lookupKey.length());
            }
        }

        if (token == null) {
            throw new UserIsNotAuthorized("Failed to find user's access token");
        }

        sessionService.logout(token);
        System.out.println("User has been successfully logged out");
    }
}

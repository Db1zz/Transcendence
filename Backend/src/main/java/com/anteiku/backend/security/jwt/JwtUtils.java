package com.anteiku.backend.security.jwt;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class JwtUtils {
//    public Optional<String> getCurrentJwt() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth == null) {
//            return Optional.empty();
//        }
//
//        Object principal = auth.getPrincipal();
//
//        if (principal instanceof String) {
//            return Optional.of((String) principal);
//        }
//        return Optional.empty();
//    }

    public Optional<String> getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }

        if (auth instanceof UsernamePasswordAuthenticationToken) {
            return Optional.of(auth.getPrincipal().toString());
        }

        if (auth instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) auth;
            return Optional.of(oAuth2AuthenticationToken.getPrincipal().getAttribute("email"));
        }

        return Optional.empty();
    }

    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated();
    }
}

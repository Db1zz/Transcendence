package com.anteiku.backend.security.jwt;

import com.anteiku.backend.security.session.SessionService;
import com.anteiku.backend.service.UserServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtServiceImpl jwtService;
    private final SessionService sessionService;
    private final UserServiceImpl userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String lookupToken = new String("Bearer ");
        String header = request.getHeader("Authorization");
        String userEmail = null;
        String token = null;
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("jwt")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null && header != null && header.startsWith(lookupToken)) {
             token = header.substring(lookupToken.length());
        }

        if (token != null) {
            if (sessionService.isSessionLogouted(token)) {
                System.out.println("Session is already logged out");
                filterChain.doFilter(request, response);
                return;
            }

            userEmail = jwtService.extractUserEmail(token);
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(token, userEmail)) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userService.getUserByEmail(userEmail).getRole());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userEmail, null, Collections.singleton(authority));

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}

package com.anteiku.backend.security.oauth2;

import com.anteiku.backend.security.jwt.JwtServiceImpl;
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
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    final JwtServiceImpl jwtService;
    // final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)  throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String userEmail = oAuth2User.getAttribute("email");
        String token = jwtService.generateToken(userEmail);

//        Map<String, Object> responseBody = new HashMap<>();
//        Date date = new Date(System.currentTimeMillis());

//        responseBody.put("token", token);
//        responseBody.put("tokenType", jwtService.getTokenType(token));
//        responseBody.put("expiresIn", jwtService.extractExpirationDate(token).getTime() - date.getTime() / 1000);
//        responseBody.put("email", jwtService.extractUserEmail(token));

//        log.info("generated token for user {}", userEmail);
////        Cookie cookie = new Cookie("token", token);
//        response.addCookie(cookie);

//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//        response.setStatus(HttpServletResponse.SC_OK);
//        response.getWriter().write(objectMapper.writeValueAsString(responseBody));
        String redirectUri = "http://localhost:3000/";
//        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(redirectUri)
//                        .queryParam("token", token);
        response.sendRedirect(redirectUri);
    }
}

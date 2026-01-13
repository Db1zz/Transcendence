package com.anteiku.backend.controller;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
public class OAuthController {

    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = principal.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserCredentialsEntity credentials = userCredentialsRepository.findByEmail(email)
                .orElse(null);

        if (credentials == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity user = userRepository.findUserById(credentials.getUserId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> userInfo = Map.of(
                "id", user.getId(),
                "email", credentials.getEmail(),
                "name", user.getUsername(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt()
        );

        return ResponseEntity.ok(userInfo);
    }

    @PreAuthorize(value = "hasAuthority('ADMIN')")
    @GetMapping("/api/info")
    public ResponseEntity<Map<String, Object>> getAppInfo() {
        Map<String, Object> map = Map.of(
                "app", "Anteiku Backend",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(map);
    }
}

package com.anteiku.backend.controller;

import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.repository.UserCredentialsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
public class AuthController {

    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;

    public AuthController(UserRepository userRepository,
                          UserCredentialsRepository userCredentialsRepository) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
    }

    @GetMapping("/login")
    public ResponseEntity<Void> redirectToFrontend() {
        URI frontendLogin = URI.create("http://localhost:3000/login");
        return ResponseEntity.status(HttpStatus.FOUND).location(frontendLogin).build();
    }

    @GetMapping("/api/user")
    public ResponseEntity<Map<String, Object>> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }

        String email = principal.getAttribute("email");
        if (email == null) {
            throw new RuntimeException("Email not found in principal");
        }

        UserCredentialsEntity credentials = userCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User credentials not found"));

        UserEntity user = userRepository.findUserById(credentials.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

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

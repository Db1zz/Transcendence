package com.anteiku.backend.controller;

import com.anteiku.backend.model.User;
import com.anteiku.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.net.URI;
import java.util.List;

@RestController
public class AuthController {

//    @GetMapping("/")
//    public String notSecured() { return "Hello from not secured"; }
//
//    @GetMapping("/secured")
//    public String secured() { return "Hello from secured"; }
//
//	@GetMapping("/test_controller")
//    public String test_controller() { return "controller is working"; }

    @GetMapping("/login")
    public ResponseEntity<Void> redirectToFrontend() {
        URI frontendLogin = URI.create("http://localhost:3000/login"); // adjust frontend URL
        return ResponseEntity.status(HttpStatus.FOUND).location(frontendLogin).build();
    }


    @GetMapping("/api/user")
    public ResponseEntity<Map<String, Object>> getUserInfo(OAuth2AuthenticationToken auth) {
        if(auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String email = auth.getPrincipal().getAttribute("email");
        String picture = auth.getPrincipal().getAttribute("picture");
        if(picture == null) {
            picture = "default.png";
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> map = Map.of(
                "email", user.getEmail(),
                "picture", picture,
                "name", user.getUsername(),
                "role", user.getRole());

        return ResponseEntity.ok(map);
    }

    @PreAuthorize(value = "hasAuthority('ADMIN')")
    @GetMapping("/api/info")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        Map<String, Object> map = Map.of(
                "app", "Anteiku Backend",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(map);
    }

}

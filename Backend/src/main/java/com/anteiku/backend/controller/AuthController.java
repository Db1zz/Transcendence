package com.anteiku.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    @GetMapping("/")
    public String notSecured() { return "Hello from not secured"; }

    @GetMapping("/secured")
    public String secured() { return "Hello from secured"; }

	@GetMapping("/test_controller")
    public String test_controller() { return "controller is working"; }
    @GetMapping("/api/user")
    public ResponseEntity<Map<String, Object>> getUserInfo(OAuth2AuthenticationToken token) {
        if (token == null) {
            return ResponseEntity.ok(null);
        }
        String email = token.getPrincipal().getAttribute("email");
        String name = token.getPrincipal().getAttribute("name");
        String picture = token.getPrincipal().getAttribute("picture");
        if (picture == null) {
            picture = "default.png";  // !!!!!!!!!!!!!!!!
        }
        Map<String, Object> map = Map.of(
                "email", email,
                "name", name,
                "picture", picture
        );v
        return ResponseEntity.ok(map);
    }

}

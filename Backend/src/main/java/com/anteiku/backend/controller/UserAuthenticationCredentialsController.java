package com.anteiku.backend.controller;

import com.anteiku.backend.repository.UserAuthenticationCredentialsRepository;
import com.anteiku.backend.model.UserAuthenticationCredentials;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users_authentication_credentials")
public class UserAuthenticationCredentialsController {
    private final UserAuthenticationCredentialsRepository userAuthenticationCredentialsRepository;

    @Autowired
    public UserAuthenticationCredentialsController(UserAuthenticationCredentialsRepository userAuthenticationCredentialsRepository) {
        this.userAuthenticationCredentialsRepository = userAuthenticationCredentialsRepository;
    }

    // GET /api/users/id
    @GetMapping("/{id}")
    public ResponseEntity<UserAuthenticationCredentials> findById(@PathVariable Long user_id) {
        Optional<UserAuthenticationCredentials> user = userAuthenticationCredentialsRepository.findById(user_id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/users
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createBook(@RequestBody UserAuthenticationCredentials user) {
        userAuthenticationCredentialsRepository.save(user);
    }
}

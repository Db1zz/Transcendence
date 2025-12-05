package com.anteiku.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anteiku.backend.model.AuthProvider;
import java.sql.Timestamp;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "username")
    String username;

    @Column(name = "email")
    String email;

    @Column(name = "created_at")
    Timestamp createdAt;

    @Column(name = "image_url")
    String imageUrl;

    @JsonIgnore
    @Column(name = "password")
    String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    AuthProvider provider;

    @Column(name = "provider_id")
    String providerId;

    public User(String username, String email, Timestamp createdAt) {
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }
}
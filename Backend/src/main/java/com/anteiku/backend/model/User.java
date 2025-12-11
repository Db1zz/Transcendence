package com.anteiku.backend.model;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    String username;

    @Column(name = "email")
    String email;

    @Column(name = "created_at")
    Timestamp createdAt;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Role role;

    public User(String username, String email, Timestamp createdAt, Role role) {
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }
}
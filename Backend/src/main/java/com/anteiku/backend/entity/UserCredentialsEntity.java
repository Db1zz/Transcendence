package com.anteiku.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "users_credentials")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserCredentialsEntity {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "password", nullable = true)
    private String password;

    @Column(name = "email")
    private String email;

    public UserCredentialsEntity(UUID userId, String email) {
        this.userId = userId;
        this.email = email;
    }
}

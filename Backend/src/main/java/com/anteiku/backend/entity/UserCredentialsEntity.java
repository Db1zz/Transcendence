package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "users_credentials")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserCredentialsEntity {
    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "password", nullable = true)
    private String password;

    @Column(name = "email", nullable = false, unique = true)
    private String email;
}

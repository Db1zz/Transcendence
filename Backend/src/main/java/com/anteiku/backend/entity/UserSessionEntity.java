package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserSessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "refresh_token", nullable = false)
    private byte[] refreshToken;

    @Column(name = "refresh_token_expires_at", nullable = false)
    private Instant refreshTokenExpiresAt;

    @Column(name = "access_token", nullable = false)
    private byte[] accessToken;

    @Column(name = "access_token_expires_at", nullable = false)
    private Instant accessTokenExpiresAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "last_active_at", nullable = false)
    @Builder.Default
    private Instant lastActiveAt =  Instant.now();

    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private Boolean revoked = false;

    @Column(name = "revoked_at", nullable = true)
    private Instant revokedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.lastActiveAt = Instant.now();
        this.revoked = false;
    }
}

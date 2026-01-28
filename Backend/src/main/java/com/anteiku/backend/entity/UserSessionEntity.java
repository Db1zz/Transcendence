package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Date;
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

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "public_key", nullable = true)
    private byte[] publicKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "last_active_at", nullable = false)
    private Instant lastActiveAt;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked;

    @Column(name = "revoked_at", nullable = true)
    private Instant revokedAt;
}

package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "channels")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChannelEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ChannelType type;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}

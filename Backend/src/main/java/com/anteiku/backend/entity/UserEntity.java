package com.anteiku.backend.entity;

import com.anteiku.backend.model.Role;
import com.anteiku.backend.model.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "display_name")
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private UserStatus status = UserStatus.OFFLINE;

    @Column(name = "about")
    private String about;

    @Column(name = "picture")
    @Builder.Default
    private String picture = "https://i.pinimg.com/736x/eb/e8/af/ebe8afd49d1a125b0950dec5d20bb98b.jpg";

    @Column(name = "username")
    private String username;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Role role = Role.USER;

    public UserEntity(String username) {
        this.username = username;
    }
}
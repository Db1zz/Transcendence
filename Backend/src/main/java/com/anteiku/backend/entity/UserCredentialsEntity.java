package com.anteiku.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "users_credentials")
@Getter @Setter @NoArgsConstructor
public class UserCredentialsEntity {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    public String getEmail() {
        return this.email;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public void setPassword(String password) {}

    public UserCredentialsEntity(UUID userId, String password, String email) {
        this.userId = userId;
        this.password = password;
        this.email = email;
    }
}

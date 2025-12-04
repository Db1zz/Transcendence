package com.anteiku.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_authentication_credentials")
@Getter @Setter @NoArgsConstructor
public class UserAuthenticationCredentials {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userId;

    @Column(name = "user_password")
    String userPassword;

    public UserAuthenticationCredentials(String userPassword) {
        this.userPassword = userPassword;
    }
}

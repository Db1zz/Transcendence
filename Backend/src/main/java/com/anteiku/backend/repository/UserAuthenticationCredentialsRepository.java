package com.anteiku.backend.repository;

import com.anteiku.backend.model.UserAuthenticationCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAuthenticationCredentialsRepository extends JpaRepository<UserAuthenticationCredentials, Long> {
}

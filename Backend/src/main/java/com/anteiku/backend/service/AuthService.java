package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.session.UserSessionsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {
    final private PasswordEncoder passwordEncoder;
    final private UserRepository userRepository;
    final private UserCredentialsRepository userCredentialsRepository;
    final private UserSessionsService userSessionsService;

    public UserAuthResponseDto authenticateUser(UserAuthDto userAuthDto) {
        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByEmail(userAuthDto.getEmail());
        if (userCredentials.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(userAuthDto.getPassword(), userCredentials.get().getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        UserEntity userEntity = userRepository.findUserById(userCredentials.get().getUserId()).get();

        UserInfoDto userInfoDto = new UserInfoDto();
        userInfoDto.setId(userEntity.getId());
        userInfoDto.setUsername(userEntity.getUsername());
        userInfoDto.setEmail(userAuthDto.getEmail());
        userInfoDto.setRole(userEntity.getRole().toString());

        UserSessionDto userSessionDto = userSessionsService.createNewSession(userAuthDto.getEmail());

        UserAuthResponseDto userAuthResponseDto = new UserAuthResponseDto();
        userAuthResponseDto.setUserInfo(userInfoDto);
        userAuthResponseDto.setAuthTokens(userSessionsService.getUserSessionAuthTokens(userSessionDto.getId()));

        return userAuthResponseDto;
    }

    public UserAuthTokensDto refreshAuthTokens(String refreshToken) {
        return userSessionsService.refreshSession(refreshToken);
    }
}

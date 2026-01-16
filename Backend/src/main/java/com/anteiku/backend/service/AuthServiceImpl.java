package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserInfoDto;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.jwt.JwtServiceImpl;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    final private PasswordEncoder passwordEncoder;
    final private UserRepository userRepository;
    final private UserCredentialsRepository userCredentialsRepository;
    final private JwtServiceImpl jwtServiceImpl;

    @Override
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

        String token = jwtServiceImpl.generateToken(userInfoDto.getEmail());

        UserAuthResponseDto userAuthResponseDto = new UserAuthResponseDto();
        userAuthResponseDto.setUserInfo(userInfoDto);
        userAuthResponseDto.setAccessToken(token);
        userAuthResponseDto.setTokenExpiresIn((jwtServiceImpl.extractExpirationDate(token).getTime() - System.currentTimeMillis()) / 1000);
        userAuthResponseDto.setTokenType(UserAuthResponseDto.TokenTypeEnum.BEARER);

        return userAuthResponseDto;
    }

//    public UserInfoDto getOAuth2UserInfo(@AuthenticationPrincipal OAuth2User principal) {
//        if (principal == null) {
//            throw new RuntimeException("User not authenticated");
//        }
//
//        String email = principal.getAttribute("email");
//        if (email == null) {
//            throw new RuntimeException("Email not found in principal");
//        }
//
//        UserCredentialsEntity userCredentialsEntity = userCredentialsRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User credentials not found"));
//
//        UserEntity userEntity = userRepository.findUserById(userCredentialsEntity.getUserId()).get();
//
//        UserInfoDto userInfoDto = new UserInfoDto();
//        userInfoDto.setId(userEntity.getId());
//        userInfoDto.setUsername(userEntity.getUsername());
//        userInfoDto.setEmail(email);
//        userInfoDto.setRole(userEntity.getRole().toString());
//
//        return userInfoDto;
//    }
}

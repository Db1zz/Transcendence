package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.EmailIsAlreadyUsedException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.UserMapper;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.jwt.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final UserMapper userMapper;

    public List<UserPublicDto> getUsersByUsername(String username) {
        List<UserEntity> users = userRepository.findUserByUsername(username);
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        return userMapper.toDtoList(users);
    }

    public UserPublicDto getUserById(UUID id) {
        UserEntity userEntity = userRepository.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toDto(userEntity);
    }

    public UserPublicDto getUserByEmail(String email) {
        UserCredentialsDto userCredentialsDto = getUserCredentialsByEmail(email);
        return userMapper.toDto(userRepository.findUserById(userCredentialsDto.getUserId()).get());
    }

    public void deleteUserById(UUID id) {
        Optional<UserEntity> userEntity = userRepository.findUserById(id);

        if (userEntity.isPresent()) {
            userRepository.deleteById(id);
        }
    }

    public UserRegistrationDto registerUser(UserRegistrationDto userRegistrationDto) {
        UserCredentialsEntity userCredentialsEntity = userMapper.toCredentialsEntity(userRegistrationDto);
        UserEntity userEntity = userMapper.toEntity(userRegistrationDto);

        if (userCredentialsRepository.existsByEmail(userCredentialsEntity.getEmail())) {
            throw new EmailIsAlreadyUsedException("Email " + userCredentialsEntity.getEmail() + " is already used");
        }

        userEntity.setRole(Role.USER);
        userEntity = userRepository.save(userEntity); // the uuid will be generated automatically
        userCredentialsEntity.setUserId(userEntity.getId());
        userCredentialsEntity.setPassword(passwordEncoder.encode(userCredentialsEntity.getPassword()));
        userCredentialsRepository.save(userCredentialsEntity);
        return userRegistrationDto;
    }

    public UserCredentialsDto getUserCredentialsByEmail(String userEmail) {
        UserCredentialsEntity userCredentialsEntity = userCredentialsRepository.findByEmail(userEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );


        return userMapper.toCredentialsDto(userCredentialsEntity);
    }

    public UserInfoDto getMe() throws AuthenticationException {
        JwtUtils jwtUtils = new JwtUtils();
        Optional<String> optionalEmail = jwtUtils.getCurrentUserEmail();
        if (optionalEmail.isEmpty()) {
                throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }

        String email = optionalEmail.get();

        UserInfoDto userInfoDto = new UserInfoDto();

        UserPublicDto userPublicDto = getUserByEmail(email);

        userInfoDto.setEmail(email);
        userInfoDto.setUsername(userPublicDto.getUsername());
        userInfoDto.setRole(userPublicDto.getRole());
        userInfoDto.setId(userPublicDto.getId());
        return userInfoDto;
    }

    public boolean isEmailAvailable(String email) {
        return !userCredentialsRepository.existsByEmail(email);
    }

    public boolean isUsernameAvailable(String username) {
        return userRepository.findUserByUsername(username).isEmpty();
    }

    public UserCredentialsDto getUserCredentialsById(UUID id) {
        return userMapper.toCredentialsDto(userCredentialsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }
}
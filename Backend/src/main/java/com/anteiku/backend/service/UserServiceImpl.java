package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.mapper.UserMapper;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired(required = true)
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    UserCredentialsRepository userCredentialsRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserCredentialsRepository userCredentialsRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userCredentialsRepository = userCredentialsRepository;
    }

    @Override
    public List<UserPublicDto> getUsersByUsername(String username) {
        List<UserEntity> users = userRepository.findUserByUsername(username);
        // TODO add exception if users were not found

        return userMapper.toDtoList(users);
    }

    @Override
    public UserPublicDto getUserById(UUID id) {
        Optional<UserEntity> userEntity = userRepository.findUserById(id);
        // TODO add exception if user was not found

        return userMapper.toDto(userEntity.get());
    }

    @Override
    public UserPublicDto getUserByEmail(String email) {
        UserCredentialsDto userCredentialsDto = getUserCredentialsByEmail(email);
        return userMapper.toDto(userRepository.findUserById(userCredentialsDto.getId()).get());
    }

    @Override
    public void deleteUserById(UUID id) {
        Optional<UserEntity> userEntity = userRepository.findUserById(id);

        if (userEntity.isPresent()) {
            userRepository.deleteById(id);
        }
    }

    @Override
    public UserRegistrationDto registerUser(UserRegistrationDto userRegistrationDto) {
        UserCredentialsEntity userCredentialsEntity = userMapper.toCredentialsEntity(userRegistrationDto);
        UserEntity userEntity = userMapper.toEntity(userRegistrationDto);

        if (userCredentialsRepository.existsByEmail(userCredentialsEntity.getEmail())) {
            // TODO throw exception "this email is already used"
        }

        userEntity.setRole(Role.USER);
        userEntity = userRepository.save(userEntity); // the uuid will be generated automatically
        userCredentialsEntity.setUserId(userEntity.getId());
        userCredentialsEntity.setPassword(passwordEncoder.encode(userCredentialsEntity.getPassword()));
        userCredentialsRepository.save(userCredentialsEntity);
        return userRegistrationDto;
    }

    @Override
    public UserCredentialsDto getUserCredentialsByEmail(String userEmail) {
        UserCredentialsEntity userCredentialsEntity = userCredentialsRepository.findByEmail(userEmail).orElseThrow(
                () -> new UserServiceException("User not found")
        );
        return userMapper.toCredentialsDto(userCredentialsEntity);
    }
}

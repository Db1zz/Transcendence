package com.anteiku.backend.serviceTests;


import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.mapper.UserMapper;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.model.UserRegistrationDto;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;

import static org.mockito.Mockito.*;
//import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserCredentialsRepository userCredentialsRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUserTest() {
        UserRegistrationDto testInputRegistrationDto = new UserRegistrationDto();
        testInputRegistrationDto.setUsername("test");
        testInputRegistrationDto.setEmail("test@example.com");
        testInputRegistrationDto.setPassword("TestPassword123!");

        UserEntity userEntity = new UserEntity();
        UserCredentialsEntity userCredentialsEntity = new UserCredentialsEntity();
        userCredentialsEntity.setPassword("TestPassword123!");

        when(userMapper.toEntity(testInputRegistrationDto)).thenReturn(userEntity);
        when(userCredentialsRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.findUserByUsername("test")).thenReturn(new ArrayList<>());
        when(userMapper.toCredentialsEntity(testInputRegistrationDto)).thenReturn(userCredentialsEntity);
        when(passwordEncoder.encode(anyString())).thenReturn("HashedPassword");

        UserRegistrationDto result = userService.registerUser(testInputRegistrationDto);
        assertNotNull(result);
        assertEquals(testInputRegistrationDto.getUsername(), result.getUsername());
        assertEquals(testInputRegistrationDto.getEmail(), result.getEmail());
        assertEquals(testInputRegistrationDto.getPassword(), result.getPassword());

        verify(userRepository, times(1)).save(userEntity);
    }
}

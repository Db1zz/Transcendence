package com.anteiku.backend.serviceTests;


import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.EmailIsAlreadyUsedException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.UserMapper;
import com.anteiku.backend.model.UserPublicDto;
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
import java.util.List;

import static org.mockito.Mockito.*;
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

    @Test
    void registerUserEmailExistsTest() {
        UserRegistrationDto testInputRegistrationDto = new UserRegistrationDto();
        testInputRegistrationDto.setEmail("test@example.com");

        when(userCredentialsRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(EmailIsAlreadyUsedException.class, () -> userService.registerUser(testInputRegistrationDto));

        verify(userRepository, never()).save(any());
    }

    @Test
    void getUsersByUsernameSuccessTest() {
        String testUsername = "test";
        List<UserEntity> mockDbRes = List.of(new UserEntity(), new UserEntity());
        List<UserPublicDto> mockMappedRes = List.of(new UserPublicDto(), new UserPublicDto());

        when(userRepository.findUserByUsername(testUsername)).thenReturn(mockDbRes);
        when(userMapper.toDtoList(mockDbRes)).thenReturn(mockMappedRes);

        List<UserPublicDto> result = userService.getUsersByUsername(testUsername);

        assertEquals(2, result.size());
        verify(userRepository, times(1)).findUserByUsername(testUsername);
    }

    @Test
    void getuserByUsernameNotFoundExceptionTest() {
        String testUsername = "test";

        when(userRepository.findUserByUsername(testUsername)).thenReturn(new ArrayList<>());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUsersByUsername(testUsername));
    }

    @Test
    void isEmailAvailableSuccessTest() {
        when(userCredentialsRepository.existsByEmail("test@example.com")).thenReturn(false);

        boolean res = userService.isEmailAvailable("test@example.com");

        assertTrue(res);
    }
}

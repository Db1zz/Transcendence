package com.anteiku.backend.service;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.EmailIsAlreadyUsedException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.UserMapper;
import com.anteiku.backend.model.*;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.naming.AuthenticationException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

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

    private UUID userId;
    private String email;
    private String username;
    private UserEntity userEntity;
    private UserPublicDto userPublicDto;
    private UserCredentialsEntity userCredentialsEntity;
    private UserCredentialsDto userCredentialsDto;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = "test@example.com";
        username = "testuser";

        userEntity = new UserEntity();
        userEntity.setId(userId);
        userEntity.setUsername(username);
        userEntity.setRole(Role.USER);
        userEntity.setStatus(UserStatus.OFFLINE);

        userPublicDto = new UserPublicDto();
        userPublicDto.setId(userId);
        userPublicDto.setUsername(username);
        userPublicDto.setRole(Role.USER.toString());

        userCredentialsEntity = new UserCredentialsEntity();
        userCredentialsEntity.setUserId(userId);
        userCredentialsEntity.setEmail(email);
        userCredentialsEntity.setPassword("encodedPassword");

        userCredentialsDto = new UserCredentialsDto();
        userCredentialsDto.setUserId(userId);
        userCredentialsDto.setEmail(email);
    }

    // ========== getUsersByUsername ==========
    @Test
    void getUsersByUsername_ShouldReturnList_WhenUsersExist() {
        List<UserEntity> entities = List.of(userEntity);
        List<UserPublicDto> dtos = List.of(userPublicDto);

        when(userRepository.findUserByUsername(username)).thenReturn(entities);
        when(userMapper.toDtoList(entities)).thenReturn(dtos);

        List<UserPublicDto> result = userService.getUsersByUsername(username);

        assertEquals(dtos, result);
        verify(userRepository).findUserByUsername(username);
        verify(userMapper).toDtoList(entities);
    }

    @Test
    void getUsersByUsername_ShouldThrowResourceNotFoundException_WhenNoUsers() {
        when(userRepository.findUserByUsername(username)).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUsersByUsername(username));
        verify(userRepository).findUserByUsername(username);
        verify(userMapper, never()).toDtoList(any());
    }

    // ========== getUserById ==========
    @Test
    void getUserById_ShouldReturnUserPublicDto_WhenUserExists() {
        when(userRepository.findUserById(userId)).thenReturn(Optional.of(userEntity));
        when(userMapper.toDto(userEntity)).thenReturn(userPublicDto);

        UserPublicDto result = userService.getUserById(userId);

        assertEquals(userPublicDto, result);
        verify(userRepository).findUserById(userId);
        verify(userMapper).toDto(userEntity);
    }

    @Test
    void getUserById_ShouldThrowResourceNotFoundException_WhenUserNotFound() {
        when(userRepository.findUserById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(userId));
        verify(userRepository).findUserById(userId);
        verify(userMapper, never()).toDto(any());
    }

    // ========== getUserByEmail ==========
    @Test
    void getUserByEmail_ShouldReturnUserPublicDto_WhenCredentialsAndUserExist() {
        when(userCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(userCredentialsEntity));
        when(userMapper.toCredentialsDto(userCredentialsEntity)).thenReturn(userCredentialsDto);
        when(userRepository.findUserById(userId)).thenReturn(Optional.of(userEntity));
        when(userMapper.toDto(userEntity)).thenReturn(userPublicDto);

        UserPublicDto result = userService.getUserByEmail(email);

        assertEquals(userPublicDto, result);
        verify(userCredentialsRepository).findByEmail(email);
        verify(userMapper).toCredentialsDto(userCredentialsEntity);
        verify(userRepository).findUserById(userId);
        verify(userMapper).toDto(userEntity);
    }

    @Test
    void getUserByEmail_ShouldPropagateResourceNotFoundException_WhenCredentialsNotFound() {
        when(userCredentialsRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserByEmail(email));
        verify(userCredentialsRepository).findByEmail(email);
        verify(userMapper, never()).toCredentialsDto(any());
        verify(userRepository, never()).findUserById(any());
    }

    // ========== deleteUserById ==========
    @Test
    void deleteUserById_ShouldDelete_WhenUserExists() {
        when(userRepository.findUserById(userId)).thenReturn(Optional.of(userEntity));

        userService.deleteUserById(userId);

        verify(userRepository).findUserById(userId);
        verify(userRepository).deleteById(userId);
    }

    @Test
    void deleteUserById_ShouldNotDelete_WhenUserDoesNotExist() {
        when(userRepository.findUserById(userId)).thenReturn(Optional.empty());

        userService.deleteUserById(userId);

        verify(userRepository).findUserById(userId);
        verify(userRepository, never()).deleteById(any());
    }

    // ========== registerUser ==========
    @Test
    void registerUser_ShouldRegisterNewUser_WhenEmailAndUsernameAreAvailable() {
        UserRegistrationDto registrationDto = new UserRegistrationDto();
        registrationDto.setEmail(email);
        registrationDto.setUsername(username);
        registrationDto.setPassword("rawPassword");

        userCredentialsEntity.setPassword("rawPassword");

        when(userCredentialsRepository.existsByEmail(email)).thenReturn(false);
        when(userRepository.findUserByUsername(username)).thenReturn(List.of());
        when(userMapper.toEntity(registrationDto)).thenReturn(userEntity);
        when(userMapper.toCredentialsEntity(registrationDto)).thenReturn(userCredentialsEntity);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");

        UserRegistrationDto result = userService.registerUser(registrationDto);

        assertEquals(registrationDto, result);
        verify(userCredentialsRepository).existsByEmail(email);
        verify(userRepository).findUserByUsername(username);
        verify(userMapper).toEntity(registrationDto);
        verify(userMapper).toCredentialsEntity(registrationDto);
        verify(passwordEncoder).encode("rawPassword");
        verify(userRepository).save(userEntity);
        // Verify bidirectional link
        assertEquals(userEntity, userCredentialsEntity.getUser());
        assertEquals(userCredentialsEntity, userEntity.getCredentials());
        assertEquals(Role.USER, userEntity.getRole());
        assertEquals(UserStatus.OFFLINE, userEntity.getStatus());
        assertEquals("encodedPassword", userCredentialsEntity.getPassword());
    }

    @Test
    void registerUser_ShouldThrowEmailIsAlreadyUsedException_WhenEmailExists() {
        UserRegistrationDto registrationDto = new UserRegistrationDto();
        registrationDto.setEmail(email);

        when(userCredentialsRepository.existsByEmail(email)).thenReturn(true);

        assertThrows(EmailIsAlreadyUsedException.class, () -> userService.registerUser(registrationDto));
        verify(userCredentialsRepository).existsByEmail(email);
        verify(userRepository, never()).findUserByUsername(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_ShouldThrowIllegalArgumentException_WhenUsernameTaken() {
        UserRegistrationDto registrationDto = new UserRegistrationDto();
        registrationDto.setEmail(email);
        registrationDto.setUsername(username);

        when(userCredentialsRepository.existsByEmail(email)).thenReturn(false);
        when(userRepository.findUserByUsername(username)).thenReturn(List.of(new UserEntity()));

        assertThrows(IllegalArgumentException.class, () -> userService.registerUser(registrationDto));
        verify(userCredentialsRepository).existsByEmail(email);
        verify(userRepository).findUserByUsername(username);
        verify(userRepository, never()).save(any());
    }

    // ========== getMe ==========
    @Test
    void getMe_ShouldReturnUserInfoDto_WhenAuthenticated() throws AuthenticationException {
        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(userRepository.findUserById(userId)).thenReturn(Optional.of(userEntity));
            when(userMapper.toDto(userEntity)).thenReturn(userPublicDto);
            when(userCredentialsRepository.findById(userId)).thenReturn(Optional.of(userCredentialsEntity));
            when(userMapper.toCredentialsDto(userCredentialsEntity)).thenReturn(userCredentialsDto);

            UserInfoDto result = userService.getMe();

            assertNotNull(result);
            assertEquals(userId, result.getId());
            assertEquals(username, result.getUsername());
            assertEquals(email, result.getEmail());
            assertEquals(Role.USER.toString(), result.getRole());
            verify(userRepository).findUserById(userId);
            verify(userCredentialsRepository).findById(userId);
        }
    }

    @Test
    void getMe_ShouldThrowAuthenticationCredentialsNotFoundException_WhenUserIdNull() {
        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentUserId).thenReturn(null);

            assertThrows(AuthenticationCredentialsNotFoundException.class, () -> userService.getMe());
            verify(userRepository, never()).findUserById(any());
        }
    }

    // ========== getUserCredentialsByEmail ==========
    @Test
    void getUserCredentialsByEmail_ShouldReturnDto_WhenFound() {
        when(userCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(userCredentialsEntity));
        when(userMapper.toCredentialsDto(userCredentialsEntity)).thenReturn(userCredentialsDto);

        UserCredentialsDto result = userService.getUserCredentialsByEmail(email);

        assertEquals(userCredentialsDto, result);
        verify(userCredentialsRepository).findByEmail(email);
        verify(userMapper).toCredentialsDto(userCredentialsEntity);
    }

    @Test
    void getUserCredentialsByEmail_ShouldThrowResourceNotFoundException_WhenNotFound() {
        when(userCredentialsRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserCredentialsByEmail(email));
        verify(userCredentialsRepository).findByEmail(email);
        verify(userMapper, never()).toCredentialsDto(any());
    }

    // ========== getUserCredentialsById ==========
    @Test
    void getUserCredentialsById_ShouldReturnDto_WhenFound() {
        when(userCredentialsRepository.findById(userId)).thenReturn(Optional.of(userCredentialsEntity));
        when(userMapper.toCredentialsDto(userCredentialsEntity)).thenReturn(userCredentialsDto);

        UserCredentialsDto result = userService.getUserCredentialsById(userId);

        assertEquals(userCredentialsDto, result);
        verify(userCredentialsRepository).findById(userId);
        verify(userMapper).toCredentialsDto(userCredentialsEntity);
    }

    @Test
    void getUserCredentialsById_ShouldThrowResourceNotFoundException_WhenNotFound() {
        when(userCredentialsRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserCredentialsById(userId));
        verify(userCredentialsRepository).findById(userId);
        verify(userMapper, never()).toCredentialsDto(any());
    }

    // ========== isEmailAvailable ==========
    @Test
    void isEmailAvailable_ShouldReturnTrue_WhenEmailNotExists() {
        when(userCredentialsRepository.existsByEmail(email)).thenReturn(false);
        assertTrue(userService.isEmailAvailable(email));
        verify(userCredentialsRepository).existsByEmail(email);
    }

    @Test
    void isEmailAvailable_ShouldReturnFalse_WhenEmailExists() {
        when(userCredentialsRepository.existsByEmail(email)).thenReturn(true);
        assertFalse(userService.isEmailAvailable(email));
        verify(userCredentialsRepository).existsByEmail(email);
    }

    // ========== isUsernameAvailable ==========
    @Test
    void isUsernameAvailable_ShouldReturnTrue_WhenUsernameNotTaken() {
        when(userRepository.findUserByUsername(username)).thenReturn(List.of());
        assertTrue(userService.isUsernameAvailable(username));
        verify(userRepository).findUserByUsername(username);
    }

    @Test
    void isUsernameAvailable_ShouldReturnFalse_WhenUsernameTaken() {
        when(userRepository.findUserByUsername(username)).thenReturn(List.of(new UserEntity()));
        assertFalse(userService.isUsernameAvailable(username));
        verify(userRepository).findUserByUsername(username);
    }
}
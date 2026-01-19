package com.anteiku.backend.service;

import com.anteiku.backend.model.UserCredentialsDto;
import com.anteiku.backend.model.UserInfoDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;

import javax.naming.AuthenticationException;
import java.util.List;
import java.util.UUID;

public interface UserService {
    UserPublicDto getUserById(UUID id);
    UserPublicDto getUserByEmail(String email);
    List<UserPublicDto> getUsersByUsername(String username);
    void deleteUserById(UUID id);
    UserRegistrationDto registerUser(UserRegistrationDto userRegistrationDto);
    UserCredentialsDto getUserCredentialsByEmail(String userEmail);
    UserInfoDto getMe() throws AuthenticationException;
    boolean isEmailAvailable(String email);
    boolean isUsernameAvailable(String username);
}

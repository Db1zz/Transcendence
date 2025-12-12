package com.anteiku.backend.service;

import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserPublicDto getUserById(UUID id);
    List<UserPublicDto> getUsersByUsername(String username);
     void deleteUserById(UUID id);
    UserRegistrationDto registerUser(UserRegistrationDto userRegistrationDto);
}

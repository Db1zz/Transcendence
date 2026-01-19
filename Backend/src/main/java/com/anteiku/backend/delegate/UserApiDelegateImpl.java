package com.anteiku.backend.delegate;

import com.anteiku.backend.api.UsersApi;
import com.anteiku.backend.model.UserInfoDto;
import com.anteiku.backend.model.UserPublicDto;
import com.anteiku.backend.model.UserRegistrationDto;
import com.anteiku.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.naming.AuthenticationException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserApiDelegateImpl implements UsersApi {
    private final UserService userService;

    @Autowired
    public UserApiDelegateImpl(UserService userService) {
        this.userService = userService;
    }

    @Override
    public ResponseEntity<UserRegistrationDto> registerUser(UserRegistrationDto user) {
        UserRegistrationDto savedUser = userService.registerUser(user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedUser);
    }

    @Override
    public ResponseEntity<List<UserPublicDto>> getUsersByUsername(String username) {
        List<UserPublicDto> users = userService.getUsersByUsername(username);
        return ResponseEntity.ok(users);
    }

    @Override
    public ResponseEntity<UserPublicDto> getUserById(UUID id) {
        UserPublicDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @Override
    public ResponseEntity<UserInfoDto> getMe() {
        try {
            UserInfoDto userInfoDto = userService.getMe();
            return ResponseEntity.ok(userInfoDto);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @Override
    public ResponseEntity<Boolean> checkEmailAvailability(@RequestParam String email) {
        boolean available = userService.isEmailAvailable(email);
        return ResponseEntity.ok().body(available);
    }

    @Override
    public ResponseEntity<Boolean> checkUsernameAvailability(@RequestParam String username) {
        boolean available = userService.isUsernameAvailable(username);
        return ResponseEntity.ok().body(available);
    }
}

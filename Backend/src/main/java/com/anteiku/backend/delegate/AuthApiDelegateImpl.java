package com.anteiku.backend.delegate;

import com.anteiku.backend.api.AuthApi;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.service.AuthServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthApiDelegateImpl implements AuthApi {
    @Autowired
    AuthServiceImpl authService;

    @Override
    public ResponseEntity<UserAuthResponseDto> authenticateUser(UserAuthDto userAuthDto) {
        try {
            UserAuthResponseDto userAuthResponseDto = authService.authenticateUser(userAuthDto);
            return ResponseEntity.ok(userAuthResponseDto);
        }  catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}

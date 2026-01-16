package com.anteiku.backend.delegate;

import com.anteiku.backend.api.AuthApi;
import com.anteiku.backend.exception.InvalidCredentialsException;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.UserAuthDto;
import com.anteiku.backend.model.UserAuthResponseDto;
import com.anteiku.backend.model.UserInfoDto;
import com.anteiku.backend.service.AuthServiceImpl;
import com.nimbusds.openid.connect.sdk.claims.UserInfo;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthApiDelegateImpl implements AuthApi {
    @Autowired
    AuthServiceImpl authService;

    @Override
    public ResponseEntity<UserAuthResponseDto> authenticateUser(UserAuthDto userAuthDto) {
        try {
            UserAuthResponseDto userAuthResponseDto = authService.authenticateUser(userAuthDto);

            ResponseCookie cookie = ResponseCookie.from("jwt", userAuthResponseDto.getAccessToken())
                    .httpOnly(true)
                    .secure(false)
                    .maxAge(3600)
                    .path("/")
                    .build();

            return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userAuthResponseDto);
        }  catch (UserNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND).body(null);
        } catch (InvalidCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }


// token with some uuid + payload
//

//    @Override
//    public ResponseEntity<UserInfoDto> getOAuth2UserInfo(@AuthenticationPrincipal OAuth2User principal) {
//        try {
//            UserInfoDto userInfoDto = authService.getOAuth2UserInfo(principal);
//            return ResponseEntity.ok(userInfoDto);
//        } catch (Exception e) {
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED).body(null);
//        }
//    }
}

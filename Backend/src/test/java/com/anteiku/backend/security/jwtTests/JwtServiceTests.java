package com.anteiku.backend.security.jwtTests;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.security.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTests {
    private JwtService jwtService;

    private final String fooSecret = "ZHVtbXlLZXlGb3JUZXN0aW5nVGhhdElzQXRMZWFzdDMyQnl0ZXNMb25nU29JdERvZXNudENyYXNo";
    private final String fooIssuer = "anteiku-test";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "privateKey", fooSecret);
        ReflectionTestUtils.setField(jwtService, "issuer", fooIssuer);
    }

    @Test
    void generateAndVerifyTokenSuccessTest() {
        String email = "example@example.com";
        String token = jwtService.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedEmail = jwtService.extractUserEmail(token);
        assertEquals(email, extractedEmail);
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void validateTokenWithChangedPayloadTest() {
        String email = "example@example.com";
        String wrongToken = jwtService.generateToken(email) + "hihi";

        assertFalse(jwtService.isTokenSignatureValid(wrongToken));
        assertFalse(jwtService.isTokenValid(wrongToken));
    }

    @Test
    void validateTokenExpiredTokenTest() {
        String email = "example@example.com";
        Date date = new Date(System.currentTimeMillis() - 3600 * 1000);
        String expiredToken = jwtService.generateToken(email, date);

        assertFalse(jwtService.isTokenValid(expiredToken));
    }

    @Test
    void extractTokenFromCookieSuccessTest() {
        String expectedToken = "header.payload.signature";
        Cookie validCookie = new Cookie(TokenNames.ACCESS_TOKEN, expectedToken);
        Cookie randomCookie = new Cookie("hihihhaha_im_nothing", "again_nothing");

        Cookie[] cookies = {validCookie, randomCookie};

        String extracted = jwtService.extractTokenFromACookies(cookies);
        assertEquals(expectedToken, extracted);
    }

    @Test
    void extractTokenFromCookieNullTest() {
        String extracted = jwtService.extractTokenFromACookies(null);
        assertNull(extracted);
    }

    @Test
    void extractTokenFromCookieEmptyTest() {
        Cookie randomCookie = new Cookie("hihihhaha_im_nothing", "again_nothing");
        Cookie[] cookies = {randomCookie};

        String extracted = jwtService.extractTokenFromACookies(cookies);
        assertNull(extracted);
    }
}

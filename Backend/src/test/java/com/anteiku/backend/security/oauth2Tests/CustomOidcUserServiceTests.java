package com.anteiku.backend.security.oauth2Tests;

import com.anteiku.backend.security.oauth2.CustomOAuth2UserService;
import com.anteiku.backend.security.oauth2.CustomOidcUserService;
import io.jsonwebtoken.lang.Maps;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CustomOidcUserServiceTests {
    @Mock
    private CustomOAuth2UserService customOAuth2UserService;
    @Mock
    private OidcUserRequest oidcUserRequest;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ClientRegistration clientRegistration;
    @Mock
    private OAuth2AccessToken oAuth2AccessToken;
    @Mock
    private OidcUser oidcUser;
    @Mock
    private OAuth2User oAuth2User;
    @Mock
    private OidcIdToken idToken;
    @InjectMocks
    private CustomOidcUserService customOidcUserService;

    @Test
    void loadUserSuccessTest() {
        when(oidcUserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(oidcUserRequest.getAccessToken()).thenReturn(oAuth2AccessToken);
        when(oidcUserRequest.getIdToken()).thenReturn(idToken);
        when(idToken.getTokenValue()).thenReturn("token-value");
        when(idToken.getClaims()).thenReturn(Map.of("sub", "12345"));
        when(customOAuth2UserService.loadUser(any(OAuth2UserRequest.class))).thenReturn(oAuth2User);

        OidcUser res = customOidcUserService.loadUser(oidcUserRequest);
        assertNotNull(res);

        ArgumentCaptor<OAuth2UserRequest> captor = ArgumentCaptor.forClass(OAuth2UserRequest.class);
        verify(customOAuth2UserService, times(1)).loadUser(captor.capture());

        OAuth2UserRequest userRequest = captor.getValue();
        assertEquals(clientRegistration, userRequest.getClientRegistration());
        assertEquals(oAuth2AccessToken, userRequest.getAccessToken());
    }

    @Test
    void loadUserExceptionTest() {
        when(oidcUserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(oidcUserRequest.getAccessToken()).thenReturn(oAuth2AccessToken);
        when(oidcUserRequest.getIdToken()).thenReturn(idToken);
        when(idToken.getTokenValue()).thenReturn("token-value");
        when(idToken.getClaims()).thenReturn(Map.of("sub", "12345"));
        when(customOAuth2UserService.loadUser(any(OAuth2UserRequest.class))).thenThrow(new OAuth2AuthenticationException("Custom database error"));

        OAuth2AuthenticationException exception = assertThrows(OAuth2AuthenticationException.class, () -> customOidcUserService.loadUser(oidcUserRequest));

        assertEquals("Custom database error", exception.getError().getErrorCode());
    }
}

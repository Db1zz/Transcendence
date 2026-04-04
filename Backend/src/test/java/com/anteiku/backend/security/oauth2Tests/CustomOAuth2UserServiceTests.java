package com.anteiku.backend.security.oauth2Tests;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.security.oauth2.CustomOAuth2UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomOAuth2UserServiceTests {
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserCredentialsRepository userCredentialsRepository;
    @Mock
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private OAuth2UserRequest oAuth2UserRequest;
    @Mock
    private OAuth2AccessToken oAuth2AccessToken;
    @Mock
    OAuth2User oAuth2User;
    @Mock (answer = Answers.RETURNS_DEEP_STUBS)
    private ClientRegistration clientRegistration;

    private CustomOAuth2UserService customOAuth2UserService;

    @BeforeEach
    public void setUp() {
        customOAuth2UserService = new CustomOAuth2UserService(userRepository, userCredentialsRepository);
        ReflectionTestUtils.setField(customOAuth2UserService, "delegate", oauth2UserService);
        ReflectionTestUtils.setField(customOAuth2UserService, "restTemplate", restTemplate);
    }

    @Test
    void loadUserExistingUserSuccessTest() {
        UUID id = UUID.randomUUID();

        when(oauth2UserService.loadUser(oAuth2UserRequest)).thenReturn(oAuth2User);
        when(oAuth2UserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(clientRegistration.getRegistrationId()).thenReturn("google");
        when(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()).thenReturn("sub");
        when(oAuth2User.getAttribute("name")).thenReturn("Test");
        when(oAuth2User.getAttribute("email")).thenReturn("test@example.com");
        when(oAuth2User.getAttributes()).thenReturn(Map.of("sub", "12345"));

        UserCredentialsEntity userCredentialsEntity = new UserCredentialsEntity();
        userCredentialsEntity.setUserId(id);
        when(userCredentialsRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userCredentialsEntity));

        UserEntity userEntity = new UserEntity();
        userEntity.setId(id);
        userEntity.setRole(Role.USER);
        when(userRepository.findUserById(id)).thenReturn(Optional.of(userEntity));

        OAuth2User oAuth2User = customOAuth2UserService.loadUser(oAuth2UserRequest);

        assertNotNull(oAuth2User);
        assertEquals("test@example.com",  oAuth2User.getAttribute("email"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void loadUserNewUserSuccessTest() {
        when(oauth2UserService.loadUser(oAuth2UserRequest)).thenReturn(oAuth2User);
        when(oAuth2UserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(clientRegistration.getRegistrationId()).thenReturn("google");
        when(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()).thenReturn("sub");
        when(oAuth2User.getAttribute("name")).thenReturn("Test");
        when(oAuth2User.getAttribute("email")).thenReturn("test@example.com");
        when(oAuth2User.getAttributes()).thenReturn(Map.of("sub", "67890"));
        when(userCredentialsRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        UserEntity userEntity = new UserEntity();
        userEntity.setId(UUID.randomUUID());
        userEntity.setRole(Role.USER);
        when(userRepository.save(any(UserEntity.class))).thenReturn(userEntity);

        OAuth2User oAuth2User = customOAuth2UserService.loadUser(oAuth2UserRequest);

        assertNotNull(oAuth2User);
        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(userCredentialsRepository, times(1)).save(any(UserCredentialsEntity.class));
    }

    @Test
    void loadUserGitHubWithoutEmailSuccessTest() {
        when(oauth2UserService.loadUser(oAuth2UserRequest)).thenReturn(oAuth2User);
        when(oAuth2UserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(clientRegistration.getRegistrationId()).thenReturn("github");
        when(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()).thenReturn("id");
        when(oAuth2User.getAttribute("name")).thenReturn("Test");
        when(oAuth2User.getAttribute("email")).thenReturn(null);
        when(oAuth2User.getAttributes()).thenReturn(Map.of("id", "9999"));
        when(oAuth2UserRequest.getAccessToken()).thenReturn(oAuth2AccessToken);
        when(oAuth2AccessToken.getTokenValue()).thenReturn("github-secret-token");

        List<Map<String, Object>> gitHubResponse = List.of(
                Map.of("email", "test@example.com", "primary", true)
        );
        ResponseEntity<List<Map<String, Object>>> responseEntity = new ResponseEntity<>(gitHubResponse, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://api.github.com/user/emails"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class)
        )).thenReturn(responseEntity);

        when(userCredentialsRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        UserEntity userEntity = new UserEntity();
        userEntity.setId(UUID.randomUUID());
        userEntity.setRole(Role.USER);
        when(userRepository.save(any(UserEntity.class))).thenReturn(userEntity);

        OAuth2User oAuth2User = customOAuth2UserService.loadUser(oAuth2UserRequest);

        assertNotNull(oAuth2User);
        assertEquals("test@example.com", oAuth2User.getAttribute("email"));
    }

    @Test
    void loadUserNoEmailExceptionTest() {
        when(oauth2UserService.loadUser(oAuth2UserRequest)).thenReturn(oAuth2User);
        when(oAuth2UserRequest.getClientRegistration()).thenReturn(clientRegistration);
        when(clientRegistration.getRegistrationId()).thenReturn("intra");
        when(oAuth2User.getAttribute("name")).thenReturn("Test");
        when(oAuth2User.getAttribute("email")).thenReturn(null);

        OAuth2AuthenticationException exception = assertThrows(OAuth2AuthenticationException.class, () -> customOAuth2UserService.loadUser(oAuth2UserRequest));

        assertEquals("Email not available from OAuth2 provider", exception.getError().getErrorCode());
    }
}

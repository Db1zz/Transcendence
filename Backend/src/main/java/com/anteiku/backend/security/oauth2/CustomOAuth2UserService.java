package com.anteiku.backend.security.oauth2;

import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.exception.UserNotFoundException;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.util.*;

@Component
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate;
    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final RestTemplate restTemplate;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   UserCredentialsRepository userCredentialsRepository) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
        this.delegate = new DefaultOAuth2UserService();
        this.restTemplate = new RestTemplate();
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("Registration ID: {}", registrationId);

        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");

        if ("github".equals(registrationId) && email == null) {
            email = fetchGitHubEmail(userRequest.getAccessToken().getTokenValue());
            log.info("Fetched GitHub email: {}", email);
        }

        log.info("User Name: {}", name);
        log.info("User Email: {}", email);

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not available from OAuth2 provider");
        }

        final String finalEmail = email;
        Optional<UserCredentialsEntity> existingCredentials = userCredentialsRepository.findByEmail(finalEmail);

        UserEntity user;
        if (existingCredentials.isPresent()) {
            user = userRepository.findUserById(existingCredentials.get().getUserId())
                    .orElseThrow(() -> new OAuth2AuthenticationException("User not found"));
            log.info("Existing user found: {}", user);
        } else {
            user = userRepository.save(UserEntity.builder()
                    .username(name)
                    .role(Role.USER)
                    .build());
            userCredentialsRepository.save(new UserCredentialsEntity(user.getId(), finalEmail));
            log.info("New user created: {}", user);
        }

         var authorities = Set.of(new SimpleGrantedAuthority(user.getRole().name()));

         String userNameAttributeName = userRequest.getClientRegistration()
                 .getProviderDetails()
                 .getUserInfoEndpoint()
                 .getUserNameAttributeName();

         Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
         attributes.put("userId", user.getId());
         attributes.put("email", finalEmail);

        return new DefaultOAuth2User(authorities, attributes, userNameAttributeName);
    }

    private String fetchGitHubEmail(String accessToken) {
        String url = "https://api.github.com/user/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("Accept", "application/vnd.github.v3+json");

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() != null) {
                return response.getBody().stream()
                        .filter(emailData -> Boolean.TRUE.equals(emailData.get("primary")))
                        .map(emailData -> (String) emailData.get("email"))
                        .findFirst()
                        .orElse(null);
            }
        } catch (Exception e) {
            log.error("Failed to fetch GitHub email", e);
        }

        return null;
    }
}
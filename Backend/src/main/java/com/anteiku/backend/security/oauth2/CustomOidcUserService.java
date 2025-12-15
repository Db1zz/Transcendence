package com.anteiku.backend.security.oauth2;
import com.anteiku.backend.entity.UserCredentialsEntity;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.repository.UserCredentialsRepository;
import com.anteiku.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
@Slf4j
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final OidcUserService oidcUserService;
    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;

    public CustomOidcUserService(UserRepository userRepository, UserCredentialsRepository userCredentialsRepository) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
        this.oidcUserService = new OidcUserService();
    }
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("Registration ID: {}", registrationId);

        OidcUser oidcUser = this.oidcUserService.loadUser(userRequest);
//        if (registrationId.equals("google")) {
//            return oidcUserService.loadUser(userRequest);
//        }
        //add github later here
        final String name = oidcUser.getAttribute("name");
        final String email = oidcUser.getAttribute("email");
        log.info("User Name: {}", name);
        log.info("User Email:{} ", email);


        Optional<UserCredentialsEntity> userCredentials = userCredentialsRepository.findByEmail(email);
        UserEntity user;
        if (userCredentials.isPresent() == false) {
            user = userRepository.save(UserEntity.builder()
                    .username(name)
//                .picture(oidcUser.getAttribute("picture"))
                    .role(Role.USER)
                    .build());
            UserCredentialsEntity entity = userCredentialsRepository.save(new UserCredentialsEntity(user.getId(), email));
        } else {
            user = userRepository.findUserById(userCredentials.get().getUserId()).get();
        }
        log.info("user in DB : {}", user);

        var authorities = Set.of(new SimpleGrantedAuthority(user.getRole().name()));

        return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}

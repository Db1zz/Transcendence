package com.anteiku.backend.security.oauth2;
import com.anteiku.backend.model.Role;
import com.anteiku.backend.model.User;
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

import java.util.Set;

@Component
@Slf4j
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final OidcUserService oidcUserService;
    private final UserRepository userRepository;

    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .username(name)
                .email(email)
//                .picture(oidcUser.getAttribute("picture"))
                .role(Role.USER)
                .build()));

        log.info("user in DB : {}", user);

        var authorities = Set.of(new SimpleGrantedAuthority(user.getRole().name()));

        return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}

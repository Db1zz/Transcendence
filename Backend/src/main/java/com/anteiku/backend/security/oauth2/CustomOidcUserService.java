package com.anteiku.backend.security.oauth2;


import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;



@Component
@Slf4j
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final OidcUserService oidcUserService;

    public CustomOidcUserService() {
        this.oidcUserService = new OidcUserService();
    }
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("Registration ID: " + registrationId);

        OidcUser oidcUser = this.oidcUserService.loadUser(userRequest);
//        if (registrationId.equals("google")) {
//            return oidcUserService.loadUser(userRequest);
//        }
        //add github later here
        String name = oidcUser.getAttribute("name");
        String email = oidcUser.getAttribute("email");
        log.info("User Name: " + name);
        log.info("User Email: " + email);
        return oidcUser;
    }
}

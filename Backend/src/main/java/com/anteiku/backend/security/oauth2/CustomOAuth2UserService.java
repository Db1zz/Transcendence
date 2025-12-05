package com.anteiku.backend.security.oauth2;

import com.anteiku.backend.model.User;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.model.AuthProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        String provider = oAuth2UserRequest.getClientRegistration().getRegistrationId();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        List<User> users = userRepository.findByEmail(email);
        User user;

        if(!users.isEmpty()) {
            user = users.get(0);
            user.setUsername(name);
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(name);
            user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
            userRepository.save(user);
        }

        return oAuth2User;
    }
}

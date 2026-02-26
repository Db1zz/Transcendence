package com.anteiku.backend.security.config;

import com.anteiku.backend.constant.TokenNames;
import com.anteiku.backend.security.jwt.JwtAuthFilter;
import com.anteiku.backend.security.jwt.JwtService;
import com.anteiku.backend.security.oauth2.CustomOAuth2UserService;
import com.anteiku.backend.security.oauth2.CustomOidcUserService;
import com.anteiku.backend.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.anteiku.backend.security.session.SessionLogoutHandler;
import com.anteiku.backend.security.session.UserSessionsService;
import com.anteiku.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtService jwtService;
    private final UserSessionsService sessionService;
    private final JwtAuthFilter jwtAuthFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final CustomOidcUserService customOidcUserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationConfiguration authenticationConfiguration, UserService userService, JwtService jwtService) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // check if it works with oauth2
                .cors(cors -> cors.configurationSource(new CorsConfig().corsConfigurationSource()))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/v3/api-docs",
                                "/swagger-resources/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api/swagger-ui.html",
                                "/v3/api-docs/swagger-config",
                                "/openapi.yaml",
                                "/ws/**",
                                "/api/users/register",
                                "/api/auth/login",
                                "/api/users/check-username",
                                "/api/users/check-email",
                                "/api/friends/**",
                                "/friends/**",
                                "/api/chat/**",
                                "/error",
                                "/api/users/public/**"
                        ).permitAll()
                        .anyRequest().authenticated())

                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                                .oidcUserService(customOidcUserService))
                        .successHandler(oAuth2AuthenticationSuccessHandler))

                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:3000/login")
                        .addLogoutHandler(new SessionLogoutHandler(sessionService, this.jwtService))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID", TokenNames.ACCESS_TOKEN, TokenNames.REFRESH_TOKEN)
                        .permitAll())

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((req, response, authException) -> {
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                        })
                        .accessDeniedHandler((req, response, accessDeniedException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN);
                        }))
         .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

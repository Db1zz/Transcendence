package com.anteiku.backend.security.session;

import com.anteiku.backend.entity.UserSessionEntity;
import com.anteiku.backend.exception.UserSessionNotFound;
import com.anteiku.backend.mapper.UserSessionMapper;
import com.anteiku.backend.model.UserAuthTokensDto;
import com.anteiku.backend.model.UserSessionDto;
import com.anteiku.backend.repository.UserSessionsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class UserSessionsServiceImpl implements UserSessionsService {
    final private HashSet<String> loggedOutSession = new HashSet<String>();
    final private UserSessionsRepository userSessionsRepository;
    final private UserSessionMapper userSessionMapper;

    @Override
    public void logout(String token) {
        if (token == null) {
            return;
        }

        if (loggedOutSession.contains(token)) {
            return;
        }
        loggedOutSession.add(token);
    }

    @Override
    public boolean isSessionLoggedOut(String token) {
        return loggedOutSession.contains(token);
    }

    @Override
    public UserSessionDto getSessionByRefreshToken(String refreshToken) {
        return userSessionMapper.toDto(userSessionsRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UserSessionNotFound("User session not found")));
    }

    @Override
    public void updateUserSession(UserSessionDto session) {
        userSessionsRepository.save(userSessionMapper.toEntity(session));
    }
}

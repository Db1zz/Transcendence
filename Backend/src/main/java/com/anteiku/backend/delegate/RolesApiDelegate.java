package com.anteiku.backend.delegate;

import com.anteiku.backend.api.RolesApi;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RolesApiDelegate implements RolesApi {
    @Override
    public ResponseEntity<CreateRoleResponseDto> createNewRole(CreateRoleDto createRoleDto) {

        return ResponseEntity.status(201).body(null);
    }

    @Override
    public ResponseEntity<Void> deleteRole(UUID roleId) {
        return ResponseEntity.status(204).body(null);
    }
}

package com.anteiku.backend.delegate;

import com.anteiku.backend.api.RolesApi;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import com.anteiku.backend.model.UpdateRoleDto;
import com.anteiku.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RolesApiDelegate implements RolesApi {
    private final RoleService roleService;

    @Override
    public ResponseEntity<CreateRoleResponseDto> createNewRole(CreateRoleDto createRoleDto) {
        return ResponseEntity.status(201).body(roleService.createNewRole(createRoleDto));
    }

    @Override
    public ResponseEntity<Void> deleteRole(UUID roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<CreateRoleResponseDto> updateRole(UUID roleId, UpdateRoleDto updateRoleDto) {
        return ResponseEntity.ok(roleService.updateRole(roleId, updateRoleDto));
    }
}

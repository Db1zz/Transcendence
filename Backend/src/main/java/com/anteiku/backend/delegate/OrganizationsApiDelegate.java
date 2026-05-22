package com.anteiku.backend.delegate;

import com.anteiku.backend.api.OrganizationsApi;
import com.anteiku.backend.model.*;
import com.anteiku.backend.service.OrganizationMemberService;
import com.anteiku.backend.service.OrganizationService;
import com.anteiku.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrganizationsApiDelegate implements OrganizationsApi {

    private final OrganizationService organizationService;
    private final RoleService roleService;
    private final OrganizationMemberService organizationMemberService;

    @Override
    public ResponseEntity<CreateOrganizationResponseDto> createOrganization(CreateOrganizationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.createOrganization(dto));
    }

    @Override
    public ResponseEntity<Void> deleteOrganization(UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Override
    public ResponseEntity<List<OrganizationDto>> getMyOrganizations() {
        return ResponseEntity.ok(organizationService.getMyOrganizations());
    }

    @Override
    public ResponseEntity<List<ServerChannelDto>> getOrganizationChannels(UUID id) {
        return ResponseEntity.ok(organizationService.getOrganizationChannels(id));
    }

    @Override
    public ResponseEntity<com.anteiku.backend.model.InviteDto> createInvite(UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createInvite(id));
    }

    @Override
    public ResponseEntity<List<CreateRoleResponseDto>> getOrganizationRoles(UUID id) {
        return ResponseEntity.ok(roleService.getOrganizationRoles(id));
    }

    @Override
    public ResponseEntity<List<ServerMemberDto>> getOrganizationMembers(UUID id) {
        return ResponseEntity.ok(organizationMemberService.getOrganizationMembers(id));
    }

    @PostMapping(value = "/organizations/{id}/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadOrganizationPicture(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String pictureUrl = organizationService.uploadOrganizationPicture(id, file);
        return ResponseEntity.ok(Map.of("url", pictureUrl));
    }
}
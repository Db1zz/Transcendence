package com.anteiku.backend.delegate;

import com.anteiku.backend.api.OrganizationsApi;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.model.OrganizationDto;
import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrganizationsApiDelegate implements OrganizationsApi {

    private final OrganizationService organizationService;

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
}
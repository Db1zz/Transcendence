package com.anteiku.backend.delegate;

import com.anteiku.backend.api.OrganizationsApi;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrganizationsApiDelegate implements OrganizationsApi {

    private final OrganizationService organizationService;

    @Override
    public ResponseEntity<CreateOrganizationResponseDto> createOrganization(CreateOrganizationDto createOrganizationDto) {
        CreateOrganizationResponseDto createOrganizationResponseDto = organizationService.createOrganization(createOrganizationDto);
        return ResponseEntity.status(201).body(createOrganizationResponseDto);
    }

    @Override
    public ResponseEntity<Void> deleteOrganization(UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }
}
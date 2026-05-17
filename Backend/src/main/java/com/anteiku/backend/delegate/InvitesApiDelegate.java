package com.anteiku.backend.delegate;

import com.anteiku.backend.api.InvitesApi;
import com.anteiku.backend.model.OrganizationDto;
import com.anteiku.backend.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InvitesApiDelegate implements InvitesApi {
    private final OrganizationService organizationService;

    @Override
    public ResponseEntity<OrganizationDto> joinWithInvite(String code) {
        return ResponseEntity.ok(organizationService.joinWithInvite(code));
    }
}

package com.anteiku.backend.serviceTests;


import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.OrganizationService;
import com.anteiku.backend.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class OrganizationServiceTests {
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrganizationService organizationService;

    @Test
    void createOrganizationSuccessTest() {
        UUID id = UUID.randomUUID();
        UserEntity userEntity = new UserEntity();
        userEntity.setId(id);
        CreateOrganizationDto input = new CreateOrganizationDto();
        input.setName("Test");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(id);
            when(userRepository.findUserById(id)).thenReturn(Optional.of(userEntity));
            when(organizationRepository.existsByName("Test")).thenReturn(false);

            CreateOrganizationResponseDto response = organizationService.createOrganization(input);

            ArgumentCaptor<OrganizationEntity> captor = ArgumentCaptor.forClass(OrganizationEntity.class);
            verify(organizationRepository, times(1)).save(captor.capture());

            OrganizationEntity org = captor.getValue();
            assertEquals("Test", org.getName());
            assertEquals(userEntity, org.getOwner());

            assertNotNull(response);
            assertEquals("Test", response.getName());
            assertEquals(id, response.getOwnerId());
        }
    }

    @Test
    void createOrganizationUserNotFoundTest() {
        UUID id = UUID.randomUUID();
        CreateOrganizationDto input = new CreateOrganizationDto();
        input.setName("Test");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(id);

            when(userRepository.findUserById(id)).thenReturn(Optional.empty());
            assertThrows(ResourceNotFoundException.class, () -> organizationService.createOrganization(input));
            verify(organizationRepository, never()).save(any());
        }
    }

    @Test
    void createOrganizationNameAlreadyExistsTest() {
        UUID id = UUID.randomUUID();
        UserEntity userEntity = new UserEntity();
        userEntity.setId(id);
        CreateOrganizationDto input = new CreateOrganizationDto();
        input.setName("Test");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(id);
            when(userRepository.findUserById(id)).thenReturn(Optional.of(userEntity));

            when(organizationRepository.existsByName("Test")).thenReturn(true);
            ConflictException exception = assertThrows(ConflictException.class, () -> organizationService.createOrganization(input));
            assertEquals("Organization with name 'Test' already exists", exception.getMessage());
            verify(organizationRepository, never()).save(any());
        }
    }

    @Test
    void deleteOrganizationSuccessTest() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserEntity userEntity = new UserEntity();
        userEntity.setId(userId);
        OrganizationEntity orgEntity = new OrganizationEntity();
        orgEntity.setId(orgId);
        orgEntity.setOwner(userEntity);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(orgEntity));

            organizationService.deleteOrganization(orgId);
            verify(organizationRepository, times(1)).delete(orgEntity);
        }
    }

    @Test
    void deleteOrganizationNotOwnerTest() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID fakeUserId = UUID.randomUUID();
        UserEntity userEntity = new UserEntity();
        userEntity.setId(userId);
        OrganizationEntity orgEntity = new OrganizationEntity();
        orgEntity.setId(orgId);
        orgEntity.setOwner(userEntity);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(fakeUserId);
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(orgEntity));

            AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> organizationService.deleteOrganization(orgId));

            assertEquals("Only owner can delete organization", exception.getMessage());
            verify(organizationRepository, never()).delete(any());
        }
    }

    @Test
    void deleteOrganizationNotFoundTest() {
        UUID orgId = UUID.randomUUID();

        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> organizationService.deleteOrganization(orgId));

        verify(organizationRepository, never()).delete(any());
    }
}

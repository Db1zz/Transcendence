package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import com.anteiku.backend.model.UpdateRoleDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.RoleRepository;
import com.anteiku.backend.service.PermissionService;
import com.anteiku.backend.service.RoleService;
import com.anteiku.backend.util.PermissionFlags;
import com.anteiku.backend.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class RoleServiceTests {
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private RoleService roleService;

    @Test
    void createNewRoleSuccess() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(orgId);
        createRoleDto.setPermissions(8L);

        OrganizationEntity organizationEntity = new OrganizationEntity();
        organizationEntity.setId(orgId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organizationEntity));
            when(roleRepository.existsByNameAndOrganizationId("test", orgId)).thenReturn(false);

            CreateRoleResponseDto response = roleService.createNewRole(createRoleDto);

            ArgumentCaptor<RoleEntity> captor = ArgumentCaptor.forClass(RoleEntity.class);
            verify(roleRepository, times(1)).save(captor.capture());

            RoleEntity roleEntity = captor.getValue();
            assertEquals("test", roleEntity.getName());
            assertEquals(organizationEntity, roleEntity.getOrganization());
            assertEquals(8L, roleEntity.getPermissionMask());
            assertNotNull(roleEntity.getCreatedAt());

            assertEquals("test", response.getName());
            assertEquals(orgId, response.getOrganizationId());
            assertEquals(8L, response.getPermissions());
        }
    }

    @Test
    void createNewRoleOrganizationNotFoundTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(orgId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> roleService.createNewRole(createRoleDto));

            assertEquals("Organization with id '" + orgId + "' not found", exception.getMessage());
            verify(roleRepository, never()).save(any());
            verify(roleRepository, never()).existsByNameAndOrganizationId(anyString(), any());
        }
    }

    @Test
    void createNewRoleAlreadyExistTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(orgId);

        OrganizationEntity organizationEntity = new OrganizationEntity();
        organizationEntity.setId(orgId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organizationEntity));
            when(roleRepository.existsByNameAndOrganizationId("test", orgId)).thenReturn(true);

            ConflictException exception = assertThrows(ConflictException.class, () -> roleService.createNewRole(createRoleDto));
            assertEquals("Role with name 'test' is already exists in organization '" + orgId + "'", exception.getMessage());
            verify(roleRepository, never()).save(any());
        }
    }

    @Test
    void getOrganizationRolesSuccess() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        RoleEntity role = new RoleEntity();
        role.setId(UUID.randomUUID());
        role.setName("Admin");
        role.setOrganization(org);
        role.setPermissionMask(8L);
        role.setCreatedAt(Instant.now());

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(permissionService.calculatePermissions(orgId, userId)).thenReturn(0L);

            when(roleRepository.findByOrganizationId(orgId)).thenReturn(List.of(role));

            List<CreateRoleResponseDto> results = roleService.getOrganizationRoles(orgId);

            assertEquals(1, results.size());
            assertEquals("Admin", results.get(0).getName());
        }
    }

    @Test
    void deleteRoleSuccess() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        RoleEntity roleEntity = new RoleEntity();
        roleEntity.setId(roleId);
        roleEntity.setOrganization(org);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(roleRepository.findById(roleId)).thenReturn(Optional.of(roleEntity));
            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());

            roleService.deleteRole(roleId);

            verify(permissionService, times(1)).verifyPermissions(orgId, userId, PermissionFlags.MANAGE_ROLES);
            verify(roleRepository, times(1)).delete(roleEntity);
        }
    }

    @Test
    void deleteRoleNotFoundTest() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> roleService.deleteRole(roleId));
            assertEquals("Role with id '" + roleId + "' was not found", exception.getMessage());
            verify(roleRepository, never()).delete(any());
        }
    }

    @Test
    void updateRoleSuccess() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        UpdateRoleDto dto = new UpdateRoleDto();
        dto.setName("new-role-name");
        dto.setPermissions(16L);

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        RoleEntity role = new RoleEntity();
        role.setId(roleId);
        role.setName("old-role-name");
        role.setOrganization(org);
        role.setCreatedAt(Instant.now());

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(roleRepository.existsByNameAndOrganizationId("new-role-name", orgId)).thenReturn(false);

            CreateRoleResponseDto result = roleService.updateRole(roleId, dto);

            verify(roleRepository, times(1)).save(role);
            assertEquals("new-role-name", role.getName());
            assertEquals(16L, role.getPermissionMask());
            assertEquals("new-role-name", result.getName());
        }
    }

    @Test
    void updateRoleConflictTest() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        UpdateRoleDto dto = new UpdateRoleDto();
        dto.setName("duplicate-name");

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        RoleEntity role = new RoleEntity();
        role.setId(roleId);
        role.setName("old-name");
        role.setOrganization(org);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(roleRepository.existsByNameAndOrganizationId("duplicate-name", orgId)).thenReturn(true);

            assertThrows(ConflictException.class, () -> roleService.updateRole(roleId, dto));
            verify(roleRepository, never()).save(any());
        }
    }
}
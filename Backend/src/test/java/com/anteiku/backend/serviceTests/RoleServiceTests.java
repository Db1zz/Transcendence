package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.RoleEntity;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateRoleDto;
import com.anteiku.backend.model.CreateRoleResponseDto;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.RoleRepository;
import com.anteiku.backend.service.RoleService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private RoleService roleService;

    @Test
    void createNewRoleSuccess() {
        UUID id = UUID.randomUUID();

        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(id);

        OrganizationEntity organizationEntity = new OrganizationEntity();
        organizationEntity.setId(id);

        when(organizationRepository.findById(id)).thenReturn(Optional.of(organizationEntity));
        when(roleRepository.existsByNameAndOrganizationId("test", id)).thenReturn(false);

        CreateRoleResponseDto createRoleResponseDto = roleService.createNewRole(createRoleDto);

        ArgumentCaptor<RoleEntity> captor = ArgumentCaptor.forClass(RoleEntity.class);
        verify(roleRepository, times(1)).save(captor.capture());

        RoleEntity roleEntity = captor.getValue();
        assertEquals("test", roleEntity.getName());
        assertEquals(organizationEntity, roleEntity.getOrganization());
        assertNotNull(roleEntity.getCreatedAt());

        assertEquals("test", createRoleResponseDto.getName());
        assertEquals(id, createRoleResponseDto.getOrganizationId());
        assertNotNull(createRoleResponseDto.getCreatedAt());
    }

    @Test
    void createNewRoleOrganizationNotFoundTest() {
        UUID id = UUID.randomUUID();
        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(id);

        when(organizationRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> roleService.createNewRole(createRoleDto));

        assertEquals("Organization with id '" + id + "' not found", exception.getMessage());
        verify(roleRepository, never()).save(any());
        verify(roleRepository, never()).existsByNameAndOrganizationId(anyString(), any());
    }

    @Test
    void createNewRoleAlreadyExistTest() {
        UUID id = UUID.randomUUID();
        CreateRoleDto createRoleDto = new CreateRoleDto();
        createRoleDto.setName("test");
        createRoleDto.setOrganizationId(id);

        OrganizationEntity organizationEntity = new OrganizationEntity();
        organizationEntity.setId(id);

        when(organizationRepository.findById(id)).thenReturn(Optional.of(organizationEntity));
        when(roleRepository.existsByNameAndOrganizationId("test", id)).thenReturn(true);

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> roleService.createNewRole(createRoleDto));
        assertEquals("Role with name 'test' is already exists in organization '" + id + "'", exception.getMessage());
        verify(roleRepository, never()).save(any());
    }

    @Test
    void deleteRoleSuccess() {
        UUID id = UUID.randomUUID();
        RoleEntity roleEntity = new RoleEntity();
        roleEntity.setId(id);

        when(roleRepository.findById(id)).thenReturn(Optional.of(roleEntity));
        roleService.deleteRole(id);
        verify(roleRepository, times(1)).delete(roleEntity);
    }

    @Test
    void deleteRoleNotFoundTest() {
        UUID id = UUID.randomUUID();

        when(roleRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> roleService.deleteRole(id));
        assertEquals("Role with id '" + id + "' was not found", exception.getMessage());
        verify(roleRepository, never()).delete(any());
    }
}

package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.exception.AccessDeniedException;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.mapper.ChannelMapper;
import com.anteiku.backend.model.CreateOrganizationDto;
import com.anteiku.backend.model.CreateOrganizationResponseDto;
import com.anteiku.backend.model.InviteDto;
import com.anteiku.backend.model.OrganizationDto;
import com.anteiku.backend.repository.*;
import com.anteiku.backend.service.OrganizationService;
import com.anteiku.backend.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
    @Mock
    private OrganizationMemberRepository organizationMemberRepository;
    @Mock
    private ChannelRepository channelRepository;
    @Mock
    private OrganizationInviteRepository organizationInviteRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private ChannelMapper channelMapper;

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

            when(roleRepository.save(any(RoleEntity.class))).thenAnswer(i -> i.getArgument(0));

            CreateOrganizationResponseDto response = organizationService.createOrganization(input);

            ArgumentCaptor<OrganizationEntity> orgCaptor = ArgumentCaptor.forClass(OrganizationEntity.class);
            verify(organizationRepository, times(1)).save(orgCaptor.capture());
            OrganizationEntity org = orgCaptor.getValue();
            assertEquals("Test", org.getName());
            assertEquals(userEntity, org.getOwner());

            verify(roleRepository, times(2)).save(any(RoleEntity.class));
            verify(organizationMemberRepository, times(1)).save(any(OrganizationMemberEntity.class));
            verify(channelRepository, times(2)).save(any(ChannelEntity.class));

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
    void createInviteSuccessTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        OrganizationEntity orgEntity = new OrganizationEntity();
        orgEntity.setId(orgId);

        UserEntity userEntity = new UserEntity();
        userEntity.setId(userId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(true);
            when(organizationInviteRepository.findFirstByOrganizationIdAndCreatorIdAndExpiresAtAfter(
                    eq(orgId), eq(userId), any(Instant.class))).thenReturn(Optional.empty());

            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(orgEntity));
            when(userRepository.getReferenceById(userId)).thenReturn(userEntity);
            when(organizationInviteRepository.existsById(anyString())).thenReturn(false);

            InviteDto response = organizationService.createInvite(orgId);

            assertNotNull(response);
            assertEquals(orgId, response.getOrganizationId());
            verify(organizationInviteRepository, times(1)).save(any(OrganizationInviteEntity.class));
        }
    }

    @Test
    void joinWithInviteSuccessTest() {
        UUID userId = UUID.randomUUID();
        String inviteCode = "ABCDEF";

        OrganizationEntity orgEntity = new OrganizationEntity();
        orgEntity.setId(UUID.randomUUID());
        orgEntity.setName("Test Org");

        UserEntity owner = new UserEntity();
        owner.setId(UUID.randomUUID());
        orgEntity.setOwner(owner);
        orgEntity.setCreatedAt(Instant.now());

        UserEntity joiningUser = new UserEntity();
        joiningUser.setId(userId);

        OrganizationInviteEntity invite = new OrganizationInviteEntity();
        invite.setCode(inviteCode);
        invite.setOrganization(orgEntity);
        invite.setExpiresAt(Instant.now().plus(1, ChronoUnit.DAYS)); // Valid invite

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(organizationInviteRepository.findById(inviteCode)).thenReturn(Optional.of(invite));
            when(userRepository.getReferenceById(userId)).thenReturn(joiningUser);
            when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgEntity.getId())).thenReturn(false);

            OrganizationDto response = organizationService.joinWithInvite(inviteCode);

            assertNotNull(response);
            assertEquals("Test Org", response.getName());
            verify(organizationMemberRepository, times(1)).save(any(OrganizationMemberEntity.class));
        }
    }
}
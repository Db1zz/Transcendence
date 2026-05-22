package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.*;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.model.CreateChannelResponseDto;
import com.anteiku.backend.model.ServerChannelDto;
import com.anteiku.backend.model.UpdateChannelDto;
import com.anteiku.backend.repository.ChannelMemberRepository;
import com.anteiku.backend.repository.ChannelRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.ChannelService;
import com.anteiku.backend.service.PermissionService;
import com.anteiku.backend.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChannelServiceTests {

    @Mock
    private ChannelRepository channelRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private ChannelMemberRepository channelMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private ChannelService channelService;

    @Test
    void createChannelSuccessTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();

        CreateChannelDto dto = new CreateChannelDto();
        dto.setName("test-channel");
        dto.setChannelType(CreateChannelDto.ChannelTypeEnum.TEXT);
        dto.setOrganizationId(orgId);
        dto.setMemberIds(List.of(memberId));

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        UserEntity memberUser = new UserEntity();
        memberUser.setId(memberId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
            when(channelRepository.existsByNameAndOrganizationId("test-channel", orgId)).thenReturn(false);
            when(userRepository.getReferenceById(memberId)).thenReturn(memberUser);

            CreateChannelResponseDto res = channelService.createChannel(dto);

            ArgumentCaptor<ChannelEntity> channelCaptor = ArgumentCaptor.forClass(ChannelEntity.class);
            verify(channelRepository, times(1)).save(channelCaptor.capture());
            ChannelEntity savedChannel = channelCaptor.getValue();

            assertEquals("test-channel", savedChannel.getName());
            assertEquals(ChannelType.TEXT, savedChannel.getType());
            assertNotNull(savedChannel.getCreatedAt());

            verify(channelMemberRepository, times(1)).save(any(ChannelMemberEntity.class));

            assertNotNull(res);
            assertEquals("test-channel", res.getName());
            assertEquals(CreateChannelResponseDto.ChannelTypeEnum.TEXT, res.getChannelType());
            assertEquals(orgId, res.getOrganizationId());
        }
    }

    @Test
    void createChannelNameConflictTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        CreateChannelDto dto = new CreateChannelDto();
        dto.setName("duplicate-channel");
        dto.setChannelType(CreateChannelDto.ChannelTypeEnum.TEXT);
        dto.setOrganizationId(orgId);

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
            when(channelRepository.existsByNameAndOrganizationId("duplicate-channel", orgId)).thenReturn(true);

            assertThrows(ConflictException.class, () -> channelService.createChannel(dto));
            verify(channelRepository, never()).save(any());
        }
    }

    @Test
    void createChannelInvalidChannelTypeTest() {
        CreateChannelDto dto = new CreateChannelDto();
        dto.setName("test");
        dto.setChannelType(null);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(UUID.randomUUID());

            assertThrows(NullPointerException.class, () -> channelService.createChannel(dto));
            verify(channelRepository, never()).save(any());
        }
    }

    @Test
    void deleteChannelSuccessTest() {
        UUID userId = UUID.randomUUID();
        UUID channelId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        ChannelEntity channel = new ChannelEntity();
        channel.setId(channelId);
        channel.setName("test");
        channel.setType(ChannelType.TEXT);
        channel.setOrganization(org);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(channelRepository.findById(channelId)).thenReturn(Optional.of(channel));
            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());

            channelService.deleteChannel(channelId);

            verify(channelRepository, times(1)).delete(channel);
        }
    }

    @Test
    void deleteChannelNotFoundTest() {
        UUID randomId = UUID.randomUUID();

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(UUID.randomUUID());

            when(channelRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> channelService.deleteChannel(randomId));
            verify(channelRepository, never()).delete(any());
        }
    }

    @Test
    void updateChannelSuccessTest() {
        UUID userId = UUID.randomUUID();
        UUID channelId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        UpdateChannelDto dto = new UpdateChannelDto();
        dto.setName("new-name");

        OrganizationEntity org = new OrganizationEntity();
        org.setId(orgId);

        ChannelEntity channel = new ChannelEntity();
        channel.setId(channelId);
        channel.setName("old-name");
        channel.setType(ChannelType.TEXT);
        channel.setOrganization(org);

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(userId);

            when(channelRepository.findById(channelId)).thenReturn(Optional.of(channel));
            doNothing().when(permissionService).verifyPermissions(eq(orgId), eq(userId), anyLong());
            when(channelRepository.existsByNameAndOrganizationId("new-name", orgId)).thenReturn(false);

            ServerChannelDto result = channelService.updateChannel(channelId, dto);

            verify(channelRepository, times(1)).save(channel);
            assertEquals("new-name", result.getName());
            assertEquals(ServerChannelDto.TypeEnum.TEXT, result.getType());
        }
    }
}
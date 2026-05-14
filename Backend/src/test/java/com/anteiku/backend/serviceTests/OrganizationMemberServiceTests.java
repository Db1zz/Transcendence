package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.OrganizationMemberEntity;
import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.AddMemberDto;
import com.anteiku.backend.model.AddMemberResponseDto;
import com.anteiku.backend.repository.OrganizationMemberRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.OrganizationMemberService;
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
public class OrganizationMemberServiceTests {
    @Mock
    private OrganizationMemberRepository organizationMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private OrganizationMemberService organizationMemberService;

    @Test
    void addMemberSuccessTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        AddMemberDto addMemberDto = new AddMemberDto();
        addMemberDto.setUserId(userId);
        addMemberDto.setOrganizationId(orgId);

        UserEntity userEntity = new UserEntity();
        userEntity.setId(userId);
        OrganizationEntity organizationEntity = new OrganizationEntity();
        organizationEntity.setId(orgId);

        when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organizationEntity));

        AddMemberResponseDto res =  organizationMemberService.addMember(addMemberDto);

        ArgumentCaptor<OrganizationMemberEntity> captor = ArgumentCaptor.forClass(OrganizationMemberEntity.class);
        verify(organizationMemberRepository, times(1)).save(captor.capture());

        OrganizationMemberEntity organizationMemberEntity = captor.getValue();
        assertEquals(userEntity, organizationMemberEntity.getUser());
        assertEquals(organizationEntity, organizationMemberEntity.getOrganization());
        assertNotNull(organizationMemberEntity.getJoinedAt());

        assertNotNull(res);
        assertEquals(userId, res.getUserId());
        assertEquals(orgId, res.getOrganizationId());
        assertNotNull(res.getJoinedAt());
    }

    @Test
    void addMemberAlreadyExistsTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        AddMemberDto addMemberDto = new AddMemberDto();
        addMemberDto.setUserId(userId);
        addMemberDto.setOrganizationId(orgId);

        when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class, () -> organizationMemberService.addMember(addMemberDto));

        assertEquals("User with id '" + userId + "' is already a member of organization '" + orgId + "'", exception.getMessage());

        verify(userRepository, never()).findById(any());
        verify(organizationMemberRepository, never()).save(any());
    }

    @Test
    void addMemberUserNotFoundTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        AddMemberDto addMemberDto = new AddMemberDto();
        addMemberDto.setUserId(userId);
        addMemberDto.setOrganizationId(orgId);

        when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> organizationMemberService.addMember(addMemberDto));

        verify(organizationRepository, never()).findById(any());
        verify(organizationMemberRepository, never()).save(any());
    }

    @Test
    void addMemberOrganizationNotFoundTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        AddMemberDto addMemberDto = new AddMemberDto();
        addMemberDto.setUserId(userId);
        addMemberDto.setOrganizationId(orgId);

        UserEntity userEntity = new UserEntity();
        userEntity.setId(userId);

        when(organizationMemberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> organizationMemberService.addMember(addMemberDto));

        verify(organizationMemberRepository, never()).save(any());
    }

    @Test
    void deleteMemberSuccessTest() {
        UUID memberId = UUID.randomUUID();
        OrganizationMemberEntity organizationMemberEntity = new OrganizationMemberEntity();
        organizationMemberEntity.setId(memberId);

        when(organizationMemberRepository.findById(memberId)).thenReturn(Optional.of(organizationMemberEntity));

        organizationMemberService.removeMember(memberId);

        verify(organizationMemberRepository, times(1)).delete(organizationMemberEntity);
    }

    @Test
    void removeMemberNotFoundTest() {
        UUID memberId = UUID.randomUUID();

        when(organizationMemberRepository.findById(memberId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> organizationMemberService.removeMember(memberId));

        verify(organizationMemberRepository, never()).delete(any());
    }
}

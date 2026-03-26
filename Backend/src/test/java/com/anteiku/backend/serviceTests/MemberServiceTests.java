package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.MemberEntity;
import com.anteiku.backend.entity.OrganizationEntity;
import com.anteiku.backend.entity.UserEntity;
import com.anteiku.backend.exception.ConflictException;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.AddMemberDto;
import com.anteiku.backend.model.AddMemberResponseDto;
import com.anteiku.backend.repository.MemberRepository;
import com.anteiku.backend.repository.OrganizationRepository;
import com.anteiku.backend.repository.UserRepository;
import com.anteiku.backend.service.MemberService;
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
public class MemberServiceTests {
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private MemberService memberService;

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

        when(memberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organizationEntity));

        AddMemberResponseDto res =  memberService.addMember(addMemberDto);

        ArgumentCaptor<MemberEntity> captor = ArgumentCaptor.forClass(MemberEntity.class);
        verify(memberRepository, times(1)).save(captor.capture());

        MemberEntity memberEntity = captor.getValue();
        assertEquals(userEntity, memberEntity.getUser());
        assertEquals(organizationEntity, memberEntity.getOrganization());
        assertNotNull(memberEntity.getJoinedAt());

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

        when(memberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class, () -> memberService.addMember(addMemberDto));

        assertEquals("User with id '" + userId + "' is already a member of organization '" + orgId + "'", exception.getMessage());

        verify(userRepository, never()).findById(any());
        verify(memberRepository, never()).save(any());
    }

    @Test
    void addMemberUserNotFoundTest() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        AddMemberDto addMemberDto = new AddMemberDto();
        addMemberDto.setUserId(userId);
        addMemberDto.setOrganizationId(orgId);

        when(memberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> memberService.addMember(addMemberDto));

        verify(organizationRepository, never()).findById(any());
        verify(memberRepository, never()).save(any());
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

        when(memberRepository.existsByUserIdAndOrganizationId(userId, orgId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> memberService.addMember(addMemberDto));

        verify(memberRepository, never()).save(any());
    }

    @Test
    void deleteMemberSuccessTest() {
        UUID memberId = UUID.randomUUID();
        MemberEntity memberEntity = new MemberEntity();
        memberEntity.setId(memberId);

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(memberEntity));

        memberService.removeMember(memberId);

        verify(memberRepository, times(1)).delete(memberEntity);
    }

    @Test
    void removeMemberNotFoundTest() {
        UUID memberId = UUID.randomUUID();

        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> memberService.removeMember(memberId));

        verify(memberRepository, never()).delete(any());
    }
}

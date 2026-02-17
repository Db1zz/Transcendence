package com.anteiku.backend.service;

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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public AddMemberResponseDto addMember(AddMemberDto addMemberDto) {
        if (memberRepository.existsByUserIdAndOrganizationId(addMemberDto.getUserId(), addMemberDto.getOrganizationId())) {
            throw new ConflictException("User with id '" + addMemberDto.getUserId() + "' is already a member of organization '" + addMemberDto.getOrganizationId() + "'");
        }

        UserEntity userEntity = userRepository.findById(addMemberDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User with id '" + addMemberDto.getUserId() + "' was not found"));

        OrganizationEntity organizationEntity = organizationRepository.findById(addMemberDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization with id '" + addMemberDto.getOrganizationId() + "' was not found"));

        MemberEntity memberEntity = new MemberEntity();
        memberEntity.setUser(userEntity);
        memberEntity.setOrganization(organizationEntity);
        memberEntity.setJoinedAt(Instant.now());
        memberRepository.save(memberEntity);

        AddMemberResponseDto addMemberResponseDto = new AddMemberResponseDto();
        addMemberResponseDto.setId(memberEntity.getId());
        addMemberResponseDto.setUserId(userEntity.getId());
        addMemberResponseDto.setOrganizationId(organizationEntity.getId());
        addMemberResponseDto.setJoinedAt(OffsetDateTime.ofInstant(memberEntity.getJoinedAt(), ZoneId.systemDefault()));

        return addMemberResponseDto;
    }

    public void removeMember(UUID memberId) {
        MemberEntity memberEntity = memberRepository.findById(memberId)
                        .orElseThrow(() -> new ResourceNotFoundException("Member with id '" + memberId + "' was not found"));

        memberRepository.delete(memberEntity);
    }
}

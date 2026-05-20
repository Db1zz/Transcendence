package com.anteiku.backend.service;

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
public class OrganizationMemberService {
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public AddMemberResponseDto addMember(AddMemberDto addMemberDto) {
        if (organizationMemberRepository.existsByUserIdAndOrganizationId(addMemberDto.getUserId(), addMemberDto.getOrganizationId())) {
            throw new ConflictException("User with id '" + addMemberDto.getUserId() + "' is already a member of organization '" + addMemberDto.getOrganizationId() + "'");
        }

        UserEntity userEntity = userRepository.findById(addMemberDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User with id '" + addMemberDto.getUserId() + "' was not found"));

        OrganizationEntity organizationEntity = organizationRepository.findById(addMemberDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization with id '" + addMemberDto.getOrganizationId() + "' was not found"));

        OrganizationMemberEntity organizationMemberEntity = new OrganizationMemberEntity();
        organizationMemberEntity.setUser(userEntity);
        organizationMemberEntity.setOrganization(organizationEntity);
        organizationMemberEntity.setJoinedAt(Instant.now());
        organizationMemberRepository.save(organizationMemberEntity);

        AddMemberResponseDto addMemberResponseDto = new AddMemberResponseDto();
        addMemberResponseDto.setId(organizationMemberEntity.getId());
        addMemberResponseDto.setUserId(userEntity.getId());
        addMemberResponseDto.setOrganizationId(organizationEntity.getId());
        addMemberResponseDto.setJoinedAt(OffsetDateTime.ofInstant(organizationMemberEntity.getJoinedAt(), ZoneId.systemDefault()));

        return addMemberResponseDto;
    }

    public void removeMember(UUID memberId) {
        OrganizationMemberEntity organizationMemberEntity = organizationMemberRepository.findById(memberId)
                        .orElseThrow(() -> new ResourceNotFoundException("Member with id '" + memberId + "' was not found"));

        organizationMemberRepository.delete(organizationMemberEntity);
    }

    public boolean isUserMemberOfOrganization(UUID memberId, UUID organizationId) {
        return organizationMemberRepository.existsByUserIdAndOrganizationId(memberId, organizationId);
    }
}

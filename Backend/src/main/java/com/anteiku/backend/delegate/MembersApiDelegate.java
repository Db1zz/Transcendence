package com.anteiku.backend.delegate;

import com.anteiku.backend.api.MembersApi;
import com.anteiku.backend.model.AddMemberDto;
import com.anteiku.backend.model.AddMemberResponseDto;
import com.anteiku.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MembersApiDelegate implements MembersApi {
    private final MemberService memberService;

    @Override
    public ResponseEntity<AddMemberResponseDto> addMember(AddMemberDto addMemberDto) {
        AddMemberResponseDto addMemberResponseDto = memberService.addMember(addMemberDto);
        return ResponseEntity.status(201).body(addMemberResponseDto);
    }

    @Override
    public ResponseEntity<Void> removeMember(UUID memberId) {
        memberService.removeMember(memberId);
        return ResponseEntity.noContent().build();
    }

}

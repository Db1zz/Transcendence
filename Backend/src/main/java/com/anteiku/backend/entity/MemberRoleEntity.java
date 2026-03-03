package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member_roles")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MemberRoleEntity {
    @EmbeddedId
    private MemberRoleId id;

    @MapsId("memberId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private MemberEntity member;

    @MapsId("roleId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;
}

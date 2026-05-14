package com.anteiku.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organization_member_roles")
@Builder
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrganizationMemberRoleEntity {
    @EmbeddedId
    private OrganizationMemberRoleId id;

    @MapsId("memberId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private OrganizationMemberEntity member;

    @MapsId("roleId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;
}

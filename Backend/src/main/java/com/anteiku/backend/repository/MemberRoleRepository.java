package com.anteiku.backend.repository;

import com.anteiku.backend.entity.MemberRoleEntity;
import com.anteiku.backend.entity.MemberRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRoleRepository extends JpaRepository<MemberRoleEntity, MemberRoleId> {
}

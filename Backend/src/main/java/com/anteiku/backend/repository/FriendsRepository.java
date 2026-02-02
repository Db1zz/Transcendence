package com.anteiku.backend.repository;

import com.anteiku.backend.entity.FriendsEntity;
import com.anteiku.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendsRepository extends JpaRepository<FriendsEntity, UUID> {
    boolean existsByRequesterAndAddressee(UserEntity requester, UserEntity addressee);
    Optional<FriendsEntity> findByRequesterAndAddressee(UserEntity requester, UserEntity addressee);
    @Query("SELECT f FROM FriendsEntity  f WHERE (f.requester = :userId OR f.addressee.id = :userId) AND f.status = 'ACCEPTED'")
    List<FriendsEntity> findAllAcceptedFriends(@Param("userId") UUID userId);
    @Query("SELECT f FROM FriendsEntity f WHERE f.addressee.id = :userId AND f.status = 'PENDING'")
    List<FriendsEntity> findPendingFriendsForMe(@Param("userId") UUID userId);
}

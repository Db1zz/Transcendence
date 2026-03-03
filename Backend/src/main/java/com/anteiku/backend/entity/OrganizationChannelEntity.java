package com.anteiku.backend.entity;

import jakarta.persistence.*;

@Entity
public class OrganizationChannelEntity {
    @EmbeddedId
    private OrganizationChannelId id;
}

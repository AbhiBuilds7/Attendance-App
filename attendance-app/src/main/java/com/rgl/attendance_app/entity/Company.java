package com.rgl.attendance_app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    public enum Status { ACTIVE, SUSPENDED, TRIAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug; // e.g. "rgl" — used for login routing later in Phase A/B

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    private Double officeLatitude;
    private Double officeLongitude;
    private Integer allowedRadiusMeters;


    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public Double getOfficeLatitude() { return officeLatitude; }
    public void setOfficeLatitude(Double officeLatitude) { this.officeLatitude = officeLatitude; }
    public Double getOfficeLongitude() { return officeLongitude; }
    public void setOfficeLongitude(Double officeLongitude) { this.officeLongitude = officeLongitude; }
    public Integer getAllowedRadiusMeters() { return allowedRadiusMeters; }
    public void setAllowedRadiusMeters(Integer allowedRadiusMeters) { this.allowedRadiusMeters = allowedRadiusMeters; }
}
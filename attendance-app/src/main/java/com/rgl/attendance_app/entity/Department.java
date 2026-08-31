package com.rgl.attendance_app.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Table(name = "departments")
@Data

@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
}
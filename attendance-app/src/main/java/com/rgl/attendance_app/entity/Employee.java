package com.rgl.attendance_app.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Table(name = "employees", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"company_id", "email"}),
        @UniqueConstraint(columnNames = {"company_id", "employee_id"})
})

@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
@Data
public class Employee {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Company getCompany() {
        return company;
    }
    public void setCompany(Company company) {
        this.company = company;
    }

    @Column(nullable = false)
    private String email;

    @ManyToOne
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private String department;

    @Enumerated(EnumType.STRING)
    private Role role;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_permissions", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "permission")
    private Set<String> permissions = new HashSet<>();

    public enum Role {
        EMPLOYEE, ADMIN, SUPER_ADMIN
    }
}
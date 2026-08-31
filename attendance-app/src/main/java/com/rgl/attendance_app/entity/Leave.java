package com.rgl.attendance_app.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.time.LocalDate;

@Entity
@Table(name = "leaves")
@Data

@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate fromDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(length = 500)
    private String reason;



    @Enumerated(EnumType.STRING)
    private LeaveStatus status = LeaveStatus.PENDING;

    public enum LeaveType {
        SICK, CASUAL, PAID
    }

    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED
    }
}
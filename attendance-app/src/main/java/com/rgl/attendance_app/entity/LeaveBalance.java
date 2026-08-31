package com.rgl.attendance_app.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Table(name = "leave_balance")
@Data

@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    private int sickLeavesLeft = 12;
    private int casualLeavesLeft = 12;
    private int paidLeavesLeft = 15;
}
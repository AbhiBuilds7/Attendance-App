package com.rgl.attendance_app.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;



@Entity
@Table(name = "attendance")
@Data
@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Attendance {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime breakStartTime;
    private Integer totalBreakMinutes = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PRESENT, LATE, ABSENT, HALF_DAY
    }
}
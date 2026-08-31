package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByCompanyIdAndEmail(Long companyId, String email);
}
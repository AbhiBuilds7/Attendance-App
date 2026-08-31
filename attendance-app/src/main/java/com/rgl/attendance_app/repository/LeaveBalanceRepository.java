package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByEmployee(Employee employee);
}
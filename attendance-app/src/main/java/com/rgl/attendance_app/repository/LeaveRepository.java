package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployee(Employee employee);
    List<Leave> findByStatus(Leave.LeaveStatus status);
}
package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    List<Attendance> findByEmployee(Employee employee);
}
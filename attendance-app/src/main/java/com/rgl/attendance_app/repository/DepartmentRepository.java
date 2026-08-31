package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
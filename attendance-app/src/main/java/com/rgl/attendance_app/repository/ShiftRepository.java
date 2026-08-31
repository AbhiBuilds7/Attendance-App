package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
}
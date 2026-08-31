package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByDate(LocalDate date);
}
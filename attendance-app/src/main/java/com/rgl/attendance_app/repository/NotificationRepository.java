package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    long countByEmployeeAndIsReadFalse(Employee employee);
}
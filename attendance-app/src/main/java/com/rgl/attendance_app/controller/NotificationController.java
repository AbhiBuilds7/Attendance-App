package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Notification;
import com.rgl.attendance_app.exception.ResourceNotFoundException;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Employee getCurrentEmployee(Authentication authentication) {
        return employeeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    @GetMapping
    public List<Notification> getMyNotifications(Authentication authentication) {
        Employee employee = getCurrentEmployee(authentication);
        return notificationRepository.findByEmployeeOrderByCreatedAtDesc(employee);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        Employee employee = getCurrentEmployee(authentication);
        long count = notificationRepository.countByEmployeeAndIsReadFalse(employee);
        return Map.of("count", count);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
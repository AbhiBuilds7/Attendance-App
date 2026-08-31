// NotificationService.java
package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Notification;
import com.rgl.attendance_app.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getMyNotifications(Employee employee) {
        return notificationRepository.findByEmployeeOrderByCreatedAtDesc(employee);
    }

    public long getUnreadCount(Employee employee) {
        return notificationRepository.countByEmployeeAndIsReadFalse(employee);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
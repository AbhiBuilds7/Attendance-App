package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.*;
import com.rgl.attendance_app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rgl.attendance_app.exception.ResourceNotFoundException;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.entity.Notification;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    // Apply for leave
    public Leave applyLeave(Long employeeId, Leave leaveRequest) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (leaveRequest.getToDate().isBefore(leaveRequest.getFromDate())) {
            throw new RuntimeException("To date cannot be before From date");
        }

        leaveRequest.setEmployee(employee);
        leaveRequest.setCompany(employee.getCompany()); // new
        leaveRequest.setStatus(Leave.LeaveStatus.PENDING);

        return leaveRepository.save(leaveRequest);
    }

    // Admin approves or rejects
    @Autowired
    private NotificationRepository notificationRepository;

    public Leave updateLeaveStatus(Long leaveId, Leave.LeaveStatus newStatus) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new RuntimeException("Leave already " + leave.getStatus());
        }

        leave.setStatus(newStatus);

        if (newStatus == Leave.LeaveStatus.APPROVED) {
            deductLeaveBalance(leave);
        }

        Leave saved = leaveRepository.save(leave);

        // create notification for the employee
        Notification notification = new Notification();
        notification.setEmployee(leave.getEmployee());
        notification.setCompany(leave.getEmployee().getCompany());
        notification.setMessage(
                "Your " + leave.getLeaveType() + " leave (" + leave.getFromDate() + " to " + leave.getToDate() + ") was " + newStatus.name().toLowerCase()
        );
        notificationRepository.save(notification);

        return saved;
    }

//    @Autowired
//    private EmployeeRepository employeeRepository;

    public LeaveBalance updateLeaveBalance(Long employeeId, LeaveBalance updatedBalance, String currentUserEmail) {
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        boolean isSuperAdmin = currentUser.getRole() == Employee.Role.SUPER_ADMIN;
        boolean canManageBalance = isSuperAdmin || currentUser.getPermissions().contains("MANAGE_LEAVE_BALANCE");

        if (!canManageBalance) {
            throw new RuntimeException("You do not have permission to manage leave balances");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LeaveBalance balance = leaveBalanceRepository.findByEmployee(employee)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        balance.setSickLeavesLeft(updatedBalance.getSickLeavesLeft());
        balance.setCasualLeavesLeft(updatedBalance.getCasualLeavesLeft());
        balance.setPaidLeavesLeft(updatedBalance.getPaidLeavesLeft());

        return leaveBalanceRepository.save(balance);
    }

    private void deductLeaveBalance(Leave leave) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee(leave.getEmployee())
                .orElseThrow(() -> new RuntimeException("Leave balance record not found"));

        long numberOfDays = ChronoUnit.DAYS.between(leave.getFromDate(), leave.getToDate()) + 1;

        switch (leave.getLeaveType()) {
            case SICK -> {
                if (balance.getSickLeavesLeft() < numberOfDays)
                    throw new RuntimeException("Insufficient sick leave balance");
                balance.setSickLeavesLeft((int) (balance.getSickLeavesLeft() - numberOfDays));
            }
            case CASUAL -> {
                if (balance.getCasualLeavesLeft() < numberOfDays)
                    throw new RuntimeException("Insufficient casual leave balance");
                balance.setCasualLeavesLeft((int) (balance.getCasualLeavesLeft() - numberOfDays));
            }
            case PAID -> {
                if (balance.getPaidLeavesLeft() < numberOfDays)
                    throw new RuntimeException("Insufficient paid leave balance");
                balance.setPaidLeavesLeft((int) (balance.getPaidLeavesLeft() - numberOfDays));
            }
        }

        leaveBalanceRepository.save(balance);
    }

    public List<Leave> getEmployeeLeaves(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return leaveRepository.findByEmployee(employee);
    }

    public List<Leave> getPendingLeaves() {
        return leaveRepository.findByStatus(Leave.LeaveStatus.PENDING);
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }
}
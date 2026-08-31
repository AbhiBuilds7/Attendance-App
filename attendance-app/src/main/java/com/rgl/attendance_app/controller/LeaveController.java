package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Leave;
import com.rgl.attendance_app.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.rgl.attendance_app.entity.LeaveBalance;
import org.springframework.security.core.Authentication;
import com.rgl.attendance_app.repository.LeaveBalanceRepository;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping("/apply/{employeeId}")
    public Leave applyLeave(@PathVariable Long employeeId, @RequestBody Leave leaveRequest) {
        return leaveService.applyLeave(employeeId, leaveRequest);
    }

    @PutMapping("/balance/{employeeId}")
    public LeaveBalance updateLeaveBalance(
            @PathVariable Long employeeId,
            @RequestBody LeaveBalance updatedBalance,
            Authentication authentication) {
        return leaveService.updateLeaveBalance(employeeId, updatedBalance, authentication.getName());
    }

    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Leave updateStatus(@PathVariable Long leaveId, @RequestParam Leave.LeaveStatus status) {
        return leaveService.updateLeaveStatus(leaveId, status);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Leave> getEmployeeLeaves(@PathVariable Long employeeId) {
        return leaveService.getEmployeeLeaves(employeeId);
    }

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping("/balance/{employeeId}")
    public LeaveBalance getLeaveBalance(@PathVariable Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return leaveBalanceRepository.findByEmployee(employee)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<Leave> getPendingLeaves() {
        return leaveService.getPendingLeaves();
    }

    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveService.getAllLeaves();
    }
}
package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import java.util.List;
import java.util.Set;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Employee createEmployee(@RequestBody Employee employee, Authentication authentication) {
        return employeeService.createEmployee(employee, authentication.getName());
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee, Authentication authentication) {
        String currentUserEmail = authentication.getName();
        return employeeService.updateEmployee(id, employee, currentUserEmail);
    }
    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Employee updatePermissions(@PathVariable Long id, @RequestBody Set<String> permissions) {
        return employeeService.updatePermissions(id, permissions);
    }

    @PutMapping("/change-password")
    public String changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        String currentUserEmail = authentication.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        employeeService.changePassword(currentUserEmail, oldPassword, newPassword);
        return "Password changed successfully";
    }



    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String deactivateEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return "Employee deactivated successfully";
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String activateEmployee(@PathVariable Long id) {
        employeeService.activateEmployee(id);
        return "Employee activated successfully";
    }
}

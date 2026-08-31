package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Leave;
import com.rgl.attendance_app.entity.LeaveBalance;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.entity.Attendance;
import com.rgl.attendance_app.repository.AttendanceRepository;
import com.rgl.attendance_app.repository.LeaveRepository;
import com.rgl.attendance_app.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
//import com.rgl.attendance_app.controller.AuthController;
import com.rgl.attendance_app.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.util.*;
import java.util.List;
import java.util.Set;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRepository leaveRepository;

//    @Autowired
//    private Leave leave;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Employee createEmployee(Employee employee, String currentUserEmail) {
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        boolean isSuperAdmin = currentUser.getRole() == Employee.Role.SUPER_ADMIN;
        boolean canCreateEmployees = isSuperAdmin || currentUser.getPermissions().contains("CREATE_EMPLOYEE");

        if (!canCreateEmployees) {
            throw new RuntimeException("You do not have permission to create employees");
        }

        boolean creatingPrivilegedAccount =
                employee.getRole() == Employee.Role.ADMIN || employee.getRole() == Employee.Role.SUPER_ADMIN;

        if (creatingPrivilegedAccount && !isSuperAdmin) {
            throw new RuntimeException("Only Super Admin can create Admin accounts");
        }

        employee.setCompany(currentUser.getCompany()); // new — new employee belongs to the creating admin's company
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        Employee saved = employeeRepository.save(employee);

        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(saved);
        balance.setCompany(saved.getCompany()); // new — LeaveBalance is tenant-scoped too
        leaveBalanceRepository.save(balance);

        return saved;
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!passwordEncoder.matches(oldPassword, employee.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
    }

    public boolean hasPermission(String email, String permission) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getRole() == Employee.Role.SUPER_ADMIN) {
            return true;
        }

        return employee.getPermissions().contains(permission);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }
    public Employee updatePermissions(Long id, Set<String> permissions) {
        Employee employee = getEmployeeById(id);

        if (employee.getRole() == Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Cannot modify Super Admin's permissions");
        }

        employee.setPermissions(permissions);
        return employeeRepository.save(employee);
    }

    public Map<String, Object> getMonthlySummary(Long employeeId, Integer month, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        List<Attendance> monthRecords = attendanceRepository.findByEmployee(employee).stream()
                .filter(a -> a.getDate().getMonthValue() == targetMonth && a.getDate().getYear() == targetYear)
                .toList();

        long presentDays = monthRecords.stream().filter(a -> a.getStatus() == Attendance.Status.PRESENT).count();
        long lateDays = monthRecords.stream().filter(a -> a.getStatus() == Attendance.Status.LATE).count();
        long halfDays = monthRecords.stream().filter(a -> a.getStatus() == Attendance.Status.HALF_DAY).count();

        long approvedLeaves = leaveRepository.findByEmployee(employee).stream()
                .filter(l -> l.getStatus() == Leave.LeaveStatus.APPROVED)
                .filter(l -> l.getFromDate().getMonthValue() == targetMonth && l.getFromDate().getYear() == targetYear)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("month", targetMonth);
        summary.put("year", targetYear);
        summary.put("presentDays", presentDays);
        summary.put("lateDays", lateDays);
        summary.put("halfDays", halfDays);
        summary.put("leavesApproved", approvedLeaves);
        summary.put("totalDaysWorked", presentDays + lateDays + halfDays);

        return summary;
    }



    public Employee updateEmployee(Long id, Employee updatedData, String currentUserEmail) {
        Employee employee = getEmployeeById(id);
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        boolean isSuperAdmin = currentUser.getRole() == Employee.Role.SUPER_ADMIN;
        boolean isSelf = currentUser.getId().equals(id);
        boolean canEditEmployees = isSuperAdmin || currentUser.getPermissions().contains("EDIT_EMPLOYEE");

        if (!canEditEmployees && !isSelf) {
            throw new RuntimeException("You are not allowed to update this employee's profile");
        }

        employee.setName(updatedData.getName());
        employee.setEmail(updatedData.getEmail());
        employee.setDepartment(updatedData.getDepartment());

        if (canEditEmployees) {
            employee.setEmployeeId(updatedData.getEmployeeId());

            boolean assigningPrivilegedRole =
                    updatedData.getRole() == Employee.Role.ADMIN || updatedData.getRole() == Employee.Role.SUPER_ADMIN;

            if (assigningPrivilegedRole && !isSuperAdmin) {
                throw new RuntimeException("Only Super Admin can assign Admin roles");
            }

            employee.setRole(updatedData.getRole());
        }

        return employeeRepository.save(employee);
    }
    public void deactivateEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    public void activateEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setActive(true);
        employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
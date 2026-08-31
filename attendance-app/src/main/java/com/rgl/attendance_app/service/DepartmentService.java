package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Department;
import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.repository.DepartmentRepository;
import com.rgl.attendance_app.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
        // now runs inside a @Service method, so TenantFilterAspect activates
        // the Hibernate companyFilter — this becomes correctly tenant-scoped
    }

    public Department createDepartment(Department department, String currentUserEmail) {
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        department.setCompany(currentUser.getCompany());
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Company;
import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.repository.CompanyRepository;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import com.rgl.attendance_app.entity.Company;
import com.rgl.attendance_app.repository.CompanyRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String companySlug = request.get("companySlug");
        String email = request.get("email");
        String rawPassword = request.get("password");

        Company company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new RuntimeException("Invalid company"));

        Employee employee = employeeRepository.findByCompanyIdAndEmail(company.getId(), email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!employee.isActive()) {
            throw new RuntimeException("This account has been deactivated");
        }

        if (!passwordEncoder.matches(rawPassword, employee.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(employee); // was: employee.getEmail() — now needs full Employee

        return Map.of(
                "token", token,
                "role", employee.getRole().toString(),
                "employeeId", employee.getId().toString(),
                "name", employee.getName(),
                "email", employee.getEmail(),
                "department", employee.getDepartment(),
                "companyName", employee.getCompany().getName(),
                "logoUrl", employee.getCompany().getLogoUrl() != null ? employee.getCompany().getLogoUrl() : ""
        );
    }
    @Transactional
    @PostMapping("/signup-company")
    public Map<String, String> signupCompany(@RequestBody Map<String, String> request) {
        String companyName = request.get("companyName");
        String companySlug = request.get("companySlug");
        String adminName = request.get("adminName");
        String adminEmail = request.get("adminEmail");
        String adminPassword = request.get("adminPassword");
        String logoUrl = request.get("logoUrl");

        if (companyName == null || companySlug == null || adminName == null
                || adminEmail == null || adminPassword == null) {
            throw new RuntimeException("All fields are required");
        }


        if (!companySlug.matches("^[a-z0-9-]+$")) {
            throw new RuntimeException("Company slug can only contain lowercase letters, numbers, and hyphens");
        }


        List<String> reserved = List.of("admin", "api", "www", "app", "auth", "login");
        if (reserved.contains(companySlug)) {
            throw new RuntimeException("This company slug is reserved, please choose another");
        }


        if (companyRepository.findBySlug(companySlug).isPresent()) {
            throw new RuntimeException("This company slug is already taken");
        }


        Company company = new Company();
        company.setName(companyName);
        company.setSlug(companySlug);
        company.setStatus(Company.Status.ACTIVE);
        company.setLogoUrl(logoUrl);
        company = companyRepository.save(company);


        Employee admin = new Employee();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Employee.Role.SUPER_ADMIN);
        admin.setActive(true);
        admin.setCompany(company);
        admin.setEmployeeId(companySlug.toUpperCase() + "-001");// simple auto-generated employee ID
        admin.setDepartment("Admin");
        admin = employeeRepository.save(admin);

        String token = jwtUtil.generateToken(admin);

        return Map.of(
                "token", token,
                "role", admin.getRole().toString(),
                "employeeId", admin.getId().toString(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "companyName", company.getName(),
                "companySlug", company.getSlug()
        );
    }


}
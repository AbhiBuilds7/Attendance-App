package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Company;
import com.rgl.attendance_app.repository.CompanyRepository;
import com.rgl.attendance_app.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping("/me")
    public Company getMyCompany() {
        return companyRepository.findById(TenantContext.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    @PutMapping("/logo")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Company updateLogo(@RequestBody Map<String, String> request) {
        Company company = companyRepository.findById(TenantContext.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setLogoUrl(request.get("logoUrl"));
        return companyRepository.save(company);
    }

    @PutMapping("/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Company updateLocation(@RequestBody Map<String, Object> request) {
        Company company = companyRepository.findById(TenantContext.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setOfficeLatitude(((Number) request.get("officeLatitude")).doubleValue());
        company.setOfficeLongitude(((Number) request.get("officeLongitude")).doubleValue());
        company.setAllowedRadiusMeters(((Number) request.get("allowedRadiusMeters")).intValue());
        return companyRepository.save(company);
    }
}
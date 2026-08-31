package com.rgl.attendance_app.repository;

import com.rgl.attendance_app.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findBySlug(String slug);
}
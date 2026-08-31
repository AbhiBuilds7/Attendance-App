package com.rgl.attendance_app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import com.rgl.attendance_app.entity.Employee;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Changed: now takes the full Employee, not just email, so we can embed role/companyId
    public String generateToken(Employee employee) {
        return Jwts.builder()
                .subject(employee.getEmail())
                .claim("employeeId", employee.getId())
                .claim("role", employee.getRole().name())
                .claim("companyId", employee.getCompany().getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey())
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractCompanyId(String token) {
        return extractAllClaims(token).get("companyId", Long.class);
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
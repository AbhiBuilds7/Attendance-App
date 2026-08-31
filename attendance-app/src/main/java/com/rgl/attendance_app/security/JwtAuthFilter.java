package com.rgl.attendance_app.security;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.repository.EmployeeRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtUtil.isTokenValid(token)) {
                    String email = jwtUtil.extractEmail(token);
                    Long companyId = jwtUtil.extractCompanyId(token);

                    // email alone is no longer unique — must scope by companyId too
                    Employee employee = employeeRepository
                            .findByCompanyIdAndEmail(companyId, email)
                            .orElse(null);

                    if (employee != null) {
                        List<GrantedAuthority> authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())
                        );

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(email, null, authorities);

                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        // populate TenantContext for this request
                        TenantContext.setCompanyId(companyId);
                        System.out.println("JwtAuthFilter set companyId = " + companyId);
                    }
                }
            }

            filterChain.doFilter(request, response);

        } finally {
            TenantContext.clear(); // always runs — prevents companyId leaking to the next request on a reused thread
        }
    }
}
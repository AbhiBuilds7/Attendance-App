package com.rgl.attendance_app.config;

import com.rgl.attendance_app.security.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE) // must run AFTER @Transactional's advisor starts the transaction
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("@within(org.springframework.stereotype.Service)")
    public Object applyTenantFilter(ProceedingJoinPoint pjp) throws Throwable {
        Long companyId = TenantContext.getCompanyId();
        if (companyId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("companyFilter").setParameter("companyId", companyId);
        }
        return pjp.proceed();
    }
}
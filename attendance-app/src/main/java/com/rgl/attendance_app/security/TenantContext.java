package com.rgl.attendance_app.security;

public class TenantContext {

    private static final ThreadLocal<Long> CURRENT_COMPANY_ID = new ThreadLocal<>();

    public static void setCompanyId(Long companyId) {
        CURRENT_COMPANY_ID.set(companyId);
    }

    public static Long getCompanyId() {
        return CURRENT_COMPANY_ID.get();
    }

    public static void clear() {
        CURRENT_COMPANY_ID.remove(); // critical — prevents leaking into the next request on a reused thread
    }
}
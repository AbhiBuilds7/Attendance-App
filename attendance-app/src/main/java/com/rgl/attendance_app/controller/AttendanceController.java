package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Attendance;
import com.rgl.attendance_app.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAttendance() {
        List<Attendance> records = attendanceService.getAllAttendance();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("Employee Name,Employee ID,Date,Check In,Check Out,Status");

        for (Attendance a : records) {
            writer.println(
                    a.getEmployee().getName() + "," +
                            a.getEmployee().getEmployeeId() + "," +
                            a.getDate() + "," +
                            (a.getCheckInTime() != null ? a.getCheckInTime() : "") + "," +
                            (a.getCheckOutTime() != null ? a.getCheckOutTime() : "") + "," +
                            a.getStatus()
            );
        }

        writer.flush();
        writer.close();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out.toByteArray());
    }

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/checkin/{employeeId}")
    public Attendance checkIn(@PathVariable Long employeeId, @RequestBody(required = false) Map<String, Double> location) {
        Double lat = location != null ? location.get("latitude") : null;
        Double lng = location != null ? location.get("longitude") : null;
        return attendanceService.markCheckIn(employeeId, lat, lng);
    }

    @PostMapping("/break-start/{employeeId}")
    public Attendance startBreak(@PathVariable Long employeeId) {
        return attendanceService.startBreak(employeeId);
    }

    @PostMapping("/break-end/{employeeId}")
    public Attendance endBreak(@PathVariable Long employeeId) {
        return attendanceService.endBreak(employeeId);
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Map<String, Object> getDashboardStats() {
        return attendanceService.getDashboardStats();
    }

    @GetMapping("/weekly-trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<Map<String, Object>> getWeeklyTrend() {
        return attendanceService.getWeeklyTrend();
    }

    @GetMapping("/monthly-summary/{employeeId}")
    public Map<String, Object> getMonthlySummary(@PathVariable Long employeeId,
                                                 @RequestParam(required = false) Integer month,
                                                 @RequestParam(required = false) Integer year) {
        return attendanceService.getMonthlySummary(employeeId, month, year);
    }



    @PostMapping("/checkout/{employeeId}")
    public Attendance checkOut(@PathVariable Long employeeId) {
        return attendanceService.markCheckOut(employeeId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getEmployeeAttendance(@PathVariable Long employeeId) {
        return attendanceService.getEmployeeAttendance(employeeId);
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }
}
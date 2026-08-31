package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Attendance;
import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.repository.AttendanceRepository;
import com.rgl.attendance_app.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rgl.attendance_app.repository.HolidayRepository;
import java.util.HashMap;
import com.rgl.attendance_app.entity.Leave;
import com.rgl.attendance_app.entity.Company;
import java.util.Map;
import java.util.ArrayList;
import com.rgl.attendance_app.repository.LeaveRepository;
//import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.exception.ResourceNotFoundException;
//import java.time.LocalDate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
//    private EmployeeRepository employeeRepository;

    private static final LocalTime OFFICE_START_TIME = LocalTime.of(9,31 );
    private static final LocalTime HALF_DAY_CUTOFF = LocalTime.of(14, 0);

    // Mark check-in
    public Attendance markCheckIn(Long employeeId, Double latitude, Double longitude) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        List<Attendance> existing = attendanceRepository.findByEmployeeAndDate(employee, today);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Already checked in today");
        }

        Company company = employee.getCompany();
        if (company.getOfficeLatitude() != null && company.getOfficeLongitude() != null
                && company.getAllowedRadiusMeters() != null) {
            if (latitude == null || longitude == null) {
                throw new RuntimeException("Location is required to check in");
            }
            double distance = calculateDistanceMeters(
                    latitude, longitude,
                    company.getOfficeLatitude(), company.getOfficeLongitude()
            );
            if (distance > company.getAllowedRadiusMeters()) {
                throw new RuntimeException(
                        "You must be within office premises to check in (currently " + Math.round(distance) + "m away)"
                );
            }
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setCompany(employee.getCompany());
        attendance.setDate(today);
        attendance.setCheckInTime(LocalTime.now());

        LocalTime cutoff = (employee.getShift() != null)
                ? employee.getShift().getStartTime()
                : OFFICE_START_TIME;

        if (LocalTime.now().isAfter(OFFICE_START_TIME)) {
            attendance.setStatus(Attendance.Status.LATE);
        } else {
            attendance.setStatus(Attendance.Status.PRESENT);
        }

        return attendanceRepository.save(attendance);
    }

    public Attendance startBreak(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        LocalDate today = LocalDate.now();
        List<Attendance> todaysRecords = attendanceRepository.findByEmployeeAndDate(employee, today);
        if (todaysRecords.isEmpty()) {
            throw new RuntimeException("You must check in before taking a break");
        }
        Attendance attendance = todaysRecords.get(0);
        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Cannot start a break after checking out");
        }
        if (attendance.getBreakStartTime() != null) {
            throw new RuntimeException("Break already in progress");
        }
        attendance.setBreakStartTime(LocalTime.now());
        return attendanceRepository.save(attendance);
    }

    public Attendance endBreak(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        LocalDate today = LocalDate.now();
        List<Attendance> todaysRecords = attendanceRepository.findByEmployeeAndDate(employee, today);
        if (todaysRecords.isEmpty()) {
            throw new RuntimeException("No attendance record found for today");
        }
        Attendance attendance = todaysRecords.get(0);
        if (attendance.getBreakStartTime() == null) {
            throw new RuntimeException("No break is currently in progress");
        }
        int minutesOnBreak = (int) java.time.Duration.between(attendance.getBreakStartTime(), LocalTime.now()).toMinutes();
        attendance.setTotalBreakMinutes(attendance.getTotalBreakMinutes() + minutesOnBreak);
        attendance.setBreakStartTime(null);
        return attendanceRepository.save(attendance);
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

    public List<Map<String, Object>> getWeeklyTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);

            long presentCount = attendanceRepository.findAll().stream()
                    .filter(a -> a.getDate().equals(date))
                    .filter(a -> a.getStatus() == Attendance.Status.PRESENT || a.getStatus() == Attendance.Status.LATE)
                    .count();

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("present", presentCount);
            trend.add(dayData);
        }

        return trend;
    }

    // Mark check-out
    public Attendance markCheckOut(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        List<Attendance> todaysRecords = attendanceRepository.findByEmployeeAndDate(employee, today);

        if (todaysRecords.isEmpty()) {
            throw new RuntimeException("No check-in found for today");
        }

        Attendance attendance = todaysRecords.get(0);
        attendance.setCheckOutTime(LocalTime.now());

        // If checked out before cutoff, mark half day
        if (LocalTime.now().isBefore(HALF_DAY_CUTOFF)) {
            attendance.setStatus(Attendance.Status.HALF_DAY);
        }

        return attendanceRepository.save(attendance);
    }

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();

        boolean isHoliday = holidayRepository.findByDate(today).isPresent();

        long totalEmployees = employeeRepository.count();

        List<Attendance> todaysAttendance = attendanceRepository.findAll().stream()
                .filter(a -> a.getDate().equals(today))
                .toList();

        long presentToday = todaysAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.Status.PRESENT || a.getStatus() == Attendance.Status.LATE)
                .count();

        List<Leave> approvedLeavesToday = leaveRepository.findAll().stream()
                .filter(l -> l.getStatus() == Leave.LeaveStatus.APPROVED)
                .filter(l -> !today.isBefore(l.getFromDate()) && !today.isAfter(l.getToDate()))
                .toList();

        long onLeaveToday = approvedLeavesToday.size();

        long absentToday = totalEmployees - presentToday - onLeaveToday;
        if (absentToday < 0) absentToday = 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("presentToday", presentToday);
        stats.put("absentToday", absentToday);
        stats.put("onLeaveToday", onLeaveToday);
        stats.put("isHoliday", isHoliday);

        return stats;
    }

//    ALTER TABLE companies ADD COLUMN allowed_radius_meters INT;
private double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
    final int EARTH_RADIUS = 6371000; // meters
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
}

    public List<Attendance> getEmployeeAttendance(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return attendanceRepository.findByEmployee(employee);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
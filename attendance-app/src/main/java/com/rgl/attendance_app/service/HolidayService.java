package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Holiday;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public Holiday createHoliday(Holiday holiday, String currentUserEmail) {
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        holiday.setCompany(currentUser.getCompany());
        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }
}
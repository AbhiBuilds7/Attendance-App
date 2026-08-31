package com.rgl.attendance_app.service;

import com.rgl.attendance_app.entity.Employee;
import com.rgl.attendance_app.entity.Shift;
import com.rgl.attendance_app.repository.EmployeeRepository;
import com.rgl.attendance_app.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public Shift createShift(Shift shift, String currentUserEmail) {
        Employee currentUser = employeeRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        shift.setCompany(currentUser.getCompany());
        return shiftRepository.save(shift);
    }

    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}
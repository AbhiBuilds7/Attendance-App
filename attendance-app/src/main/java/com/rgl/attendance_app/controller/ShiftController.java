package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Shift;
import com.rgl.attendance_app.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @GetMapping
    public List<Shift> getAllShifts() {
        return shiftService.getAllShifts();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Shift createShift(@RequestBody Shift shift, Authentication authentication) {
        return shiftService.createShift(shift, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
        return "Shift deleted";
    }
}
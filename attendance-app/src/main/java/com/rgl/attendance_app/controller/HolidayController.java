package com.rgl.attendance_app.controller;

import com.rgl.attendance_app.entity.Holiday;
import com.rgl.attendance_app.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping
    public List<Holiday> getAllHolidays() {
        return holidayService.getAllHolidays();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Holiday createHoliday(@RequestBody Holiday holiday, Authentication authentication) {
        return holidayService.createHoliday(holiday, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return "Holiday deleted";
    }
}
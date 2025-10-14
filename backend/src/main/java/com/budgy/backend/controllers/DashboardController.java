package com.budgy.backend.controllers;

import com.budgy.backend.dto.response.DashboardStatsDTO;
import com.budgy.backend.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Dashboard Controller
 *
 * Provides aggregated statistics and overview data
 */
@RestController
@RequestMapping("/api/v1/users/{userId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get Dashboard Statistics
     *
     * GET /api/v1/users/{userId}/dashboard/stats
     *
     * Returns:
     * - Current balance with change percentage
     * - Income (current month) with change from last month
     * - Expenses (current month) with change from last month
     * - Total savings with change from last month
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(@PathVariable Long userId) {
        DashboardStatsDTO stats = dashboardService.getDashboardStats(userId);
        return ResponseEntity.ok(stats);
    }
}
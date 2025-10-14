package com.budgy.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Dashboard Statistics Response DTO
 * <p>
 * Contains all financial overview data for the dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    /**
     * Current Balance Statistics
     */
    private BigDecimal currentBalance;
    private BigDecimal balanceChange;      // Change since last period
    private Double balanceChangePercent;   // Percentage change

    /**
     * Income Statistics
     */
    private BigDecimal income;             // Total income this month
    private BigDecimal incomeChange;       // Change since last month
    private Double incomeChangePercent;    // Percentage change

    /**
     * Expenses Statistics
     */
    private BigDecimal expenses;           // Total expenses this month
    private BigDecimal expenseChange;      // Change since last month
    private Double expenseChangePercent;   // Percentage change

    /**
     * Savings Statistics
     */
    private BigDecimal savings;            // Total saved across all pots
    private BigDecimal savingsChange;      // Change since last month
    private Double savingsChangePercent;   // Percentage change

    /**
     * Additional helpful data
     */
    private String period;                 // e.g., "October 2025"
    private Integer transactionCount;      // Total transactions this month
}
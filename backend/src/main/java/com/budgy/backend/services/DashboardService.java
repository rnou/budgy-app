package com.budgy.backend.services;

import com.budgy.backend.dto.response.DashboardStatsDTO;
import com.budgy.backend.entities.User;
import com.budgy.backend.enums.TransactionType;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.repositories.TransactionRepository;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

/**
 * Dashboard Service
 * <p>
 * Provides aggregated financial statistics for dashboard display
 * including income, expenses, savings, and their month-over-month changes
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Get complete dashboard statistics for a user
     * Calculates current month data and compares with previous month
     *
     * @param userId The user ID to get statistics for
     * @return DashboardStatsDTO with all financial statistics
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Get current month dates
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        // Get previous month dates
        YearMonth previousMonth = currentMonth.minusMonths(1);
        LocalDate startOfPreviousMonth = previousMonth.atDay(1);
        LocalDate endOfPreviousMonth = previousMonth.atEndOfMonth();

        // ==================== CURRENT MONTH STATISTICS ====================

        // Income: Sum of INCOME transactions this month
        BigDecimal currentIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth
        );

        // Expenses: Sum of EXPENSE transactions this month (already negative)
        BigDecimal currentExpenses = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth
        );

        // Savings: NET amount saved this month (SAVING - WITHDRAW)
        BigDecimal savingTransactions = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.SAVING, startOfMonth, endOfMonth
        );

        BigDecimal withdrawTransactions = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.WITHDRAW, startOfMonth, endOfMonth
        );

        // Net savings = money saved - money withdrawn
        BigDecimal currentSavings = savingTransactions.subtract(withdrawTransactions);

        // Transaction count
        int transactionCount = transactionRepository.countByUserIdAndTransactionDateBetween(
                userId, startOfMonth, endOfMonth
        );

        // ==================== PREVIOUS MONTH STATISTICS ====================

        BigDecimal previousIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfPreviousMonth, endOfPreviousMonth
        );

        BigDecimal previousExpenses = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfPreviousMonth, endOfPreviousMonth
        );

        BigDecimal previousSavings = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.SAVING, startOfPreviousMonth, endOfPreviousMonth
        );

        BigDecimal previousWithdrawals = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.WITHDRAW, startOfPreviousMonth, endOfPreviousMonth
        );

        // ==================== CALCULATE CHANGES ====================

        BigDecimal incomeChange = currentIncome.subtract(previousIncome);
        BigDecimal expenseChange = currentExpenses.subtract(previousExpenses);
        BigDecimal savingsChange = currentSavings.subtract(previousSavings);

        // ==================== CALCULATE PERCENTAGE CHANGES ====================

        Double incomeChangePercent = calculatePercentageChange(previousIncome, currentIncome);
        Double expenseChangePercent = calculatePercentageChange(previousExpenses, currentExpenses);
        Double savingsChangePercent = calculatePercentageChange(previousSavings, currentSavings);

        // ==================== BALANCE CALCULATION ====================

        // Current balance from user entity (already updated by TransactionService)
        BigDecimal currentBalance = user.getCurrentBalance();

        // Calculate what the balance was at the start of this month
        // Starting Balance = Current Balance - (Income - Expenses - Savings + Withdrawals)
        // Note: Expenses are already negative, so we ADD them
        BigDecimal currentMonthNetChange = currentIncome
                .add(currentExpenses)          // Expenses are negative, so this subtracts
                .subtract(currentSavings);      // Savings decrease balance

        BigDecimal previousBalance = currentBalance.subtract(currentMonthNetChange);

        // Calculate balance change
        BigDecimal balanceChange = currentBalance.subtract(previousBalance);
        Double balanceChangePercent = calculatePercentageChange(previousBalance, currentBalance);

        // Format period for display
        String period = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy"));

        // ==================== BUILD RESPONSE ====================

        return DashboardStatsDTO.builder()
                .currentBalance(currentBalance)
                .balanceChange(balanceChange)
                .balanceChangePercent(balanceChangePercent)
                .income(currentIncome)
                .incomeChange(incomeChange)
                .incomeChangePercent(incomeChangePercent)
                .expenses(currentExpenses)
                .expenseChange(expenseChange)
                .expenseChangePercent(expenseChangePercent)
                .savings(currentSavings)
                .savingsChange(savingsChange)
                .savingsChangePercent(savingsChangePercent)
                .period(period)
                .transactionCount(transactionCount)
                .build();
    }

    /**
     * Calculate percentage change between two values
     * Handles division by zero and formats to 2 decimal places
     *
     * @param oldValue Previous period value
     * @param newValue Current period value
     * @return Percentage change as double
     */
    private Double calculatePercentageChange(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.compareTo(BigDecimal.ZERO) == 0) {
            // If old value is 0, return 0% if new value is also 0, otherwise 100%
            return newValue.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : 100.0;
        }

        BigDecimal change = newValue.subtract(oldValue);
        BigDecimal percentChange = change
                .divide(oldValue.abs(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return percentChange.doubleValue();
    }
}
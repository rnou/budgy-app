package com.budgy.backend.services;

import com.budgy.backend.dto.response.DashboardStatsDTO;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.User;
import com.budgy.backend.enums.TransactionType;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.repositories.SavingPotRepository;
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
import java.util.List;

/**
 * Dashboard Service
 *
 * Provides aggregated financial statistics for dashboard display
 * including income, expenses, savings, and their month-over-month changes
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final SavingPotRepository savingPotRepository;

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

        // Calculate current month statistics using optimized queries
        BigDecimal currentIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth
        );

        BigDecimal currentExpenses = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth
        );

        BigDecimal currentSavings = calculateTotalSavings(userId);

        int transactionCount = transactionRepository.countByUserIdAndTransactionDateBetween(
                userId, startOfMonth, endOfMonth
        );

        // Calculate previous month statistics for comparison
        BigDecimal previousIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfPreviousMonth, endOfPreviousMonth
        );

        BigDecimal previousExpenses = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfPreviousMonth, endOfPreviousMonth
        );

        BigDecimal previousSavings = calculatePreviousMonthSavings(
                userId, currentSavings, startOfMonth, endOfMonth
        );

        // Calculate changes
        BigDecimal incomeChange = currentIncome.subtract(previousIncome);
        BigDecimal expenseChange = currentExpenses.subtract(previousExpenses);
        BigDecimal savingsChange = currentSavings.subtract(previousSavings);

        // Calculate percentage changes
        Double incomeChangePercent = calculatePercentageChange(previousIncome, currentIncome);
        Double expenseChangePercent = calculatePercentageChange(previousExpenses, currentExpenses);
        Double savingsChangePercent = calculatePercentageChange(previousSavings, currentSavings);

        // Current balance from user entity
        BigDecimal currentBalance = user.getCurrentBalance();

        // Calculate balance change (income - expenses this month)
        BigDecimal balanceChange = currentIncome.subtract(currentExpenses);
        Double balanceChangePercent = calculateBalanceChangePercent(currentBalance, balanceChange);

        // Format period for display
        String period = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy"));

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
     * Calculate total savings across all saving pots
     *
     * @param userId The user ID
     * @return Total saved amount across all pots
     */
    private BigDecimal calculateTotalSavings(Long userId) {
        List<SavingPot> savingPots = savingPotRepository.findByUserId(userId);

        return savingPots.stream()
                .map(SavingPot::getSaved)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total savings at the end of previous month
     * Subtracts current month's saving additions from current total
     *
     * @param userId The user ID
     * @param currentSavings Current total savings
     * @param startOfCurrentMonth Start date of current month
     * @param endOfCurrentMonth End date of current month
     * @return Savings total at end of previous month
     */
    private BigDecimal calculatePreviousMonthSavings(
            Long userId,
            BigDecimal currentSavings,
            LocalDate startOfCurrentMonth,
            LocalDate endOfCurrentMonth) {

        // Get saving additions in current month using optimized query
        BigDecimal currentMonthSavingAdditions = transactionRepository
                .sumSavingPotTransactionsByDateRange(userId, startOfCurrentMonth, endOfCurrentMonth);

        // Previous month savings = current savings - additions this month
        return currentSavings.subtract(currentMonthSavingAdditions);
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
                .divide(oldValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return percentChange.doubleValue();
    }

    /**
     * Calculate balance change percentage relative to current balance
     * Used for the balance card percentage indicator
     *
     * @param currentBalance User's current balance
     * @param change Amount of change (income - expenses)
     * @return Percentage change as double
     */
    private Double calculateBalanceChangePercent(BigDecimal currentBalance, BigDecimal change) {
        if (currentBalance.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal percentChange = change
                .divide(currentBalance, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return percentChange.doubleValue();
    }
}
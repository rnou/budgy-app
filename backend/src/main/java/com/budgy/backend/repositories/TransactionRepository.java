package com.budgy.backend.repositories;

import com.budgy.backend.entities.Transaction;
import com.budgy.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

    // ==================== EXISTING QUERIES ====================

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = :type ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.budget.id = :budgetId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndBudgetId(@Param("userId") Long userId, @Param("budgetId") Long budgetId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.savingPot.id = :savingPotId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndSavingPotId(@Param("userId") Long userId, @Param("savingPotId") Long savingPotId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // ==================== NEW QUERIES FOR DASHBOARD ====================

    /**
     * Find transactions by user, type, and date range
     * Used to calculate income/expenses for specific periods
     */
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndTypeAndTransactionDateBetween(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find saving pot transactions within date range
     * Used to calculate savings additions for a period
     */
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
            "AND t.savingPot IS NOT NULL " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndSavingPotNotNullAndTransactionDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Count transactions within date range
     * Used for dashboard statistics
     */
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    int countByUserIdAndTransactionDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // ==================== OPTIONAL: OPTIMIZED AGGREGATION QUERIES ====================
    // These are more efficient alternatives that do calculations in the database

    /**
     * Sum amounts by user, type, and date range (OPTIMIZED)
     * Returns the total directly without loading all transaction objects
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumByUserAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Sum saving pot transaction amounts within date range (OPTIMIZED)
     * Returns the total directly without loading all transaction objects
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.savingPot IS NOT NULL " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumSavingPotTransactionsByDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
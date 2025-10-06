package com.budgy.backend.repositories;

import com.budgy.backend.entities.Transaction;
import com.budgy.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

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
}
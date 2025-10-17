package com.budgy.backend.services;

import com.budgy.backend.dto.TransactionDTO;
import com.budgy.backend.dto.response.TransactionResponseDTO;
import com.budgy.backend.entities.Budget;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.Transaction;
import com.budgy.backend.entities.User;
import com.budgy.backend.enums.TransactionType;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.mappers.TransactionMapper;
import com.budgy.backend.repositories.BudgetRepository;
import com.budgy.backend.repositories.SavingPotRepository;
import com.budgy.backend.repositories.TransactionRepository;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final SavingPotRepository savingPotRepository;

    public List<TransactionResponseDTO> getAllTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(TransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponseDTO> getTransactionsByUserAndType(Long userId, String type) {
        TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
        return transactionRepository.findByUserIdAndType(userId, transactionType).stream()
                .map(TransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponseDTO> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate).stream()
                .map(TransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponseDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        return TransactionMapper.toResponse(transaction);
    }

    public TransactionResponseDTO createTransaction(Long userId, TransactionDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Budget budget = null;
        if (dto.getBudgetId() != null) {
            budget = budgetRepository.findById(dto.getBudgetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", dto.getBudgetId()));
        }

        SavingPot savingPot = null;
        if (dto.getSavingPotId() != null) {
            savingPot = savingPotRepository.findById(dto.getSavingPotId())
                    .orElseThrow(() -> new ResourceNotFoundException("SavingPot", "id", dto.getSavingPotId()));
        }

        Transaction transaction = TransactionMapper.toEntity(dto, user, budget, savingPot);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update budget spent and count after creating transaction
        if (budget != null && transaction.getType() == TransactionType.EXPENSE) {
            budget.addToSpent(transaction.getAmount());
            budget.incrementTransactionCount();
            budgetRepository.save(budget);
        }

        return TransactionMapper.toResponse(savedTransaction);
    }

    public TransactionResponseDTO updateTransaction(Long id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        // Store old values for budget recalculation
        Budget oldBudget = transaction.getBudget();
        BigDecimal oldAmount = transaction.getAmount();
        TransactionType oldType = transaction.getType();

        Budget budget = null;
        if (dto.getBudgetId() != null) {
            budget = budgetRepository.findById(dto.getBudgetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", dto.getBudgetId()));
        }

        SavingPot savingPot = null;
        if (dto.getSavingPotId() != null) {
            savingPot = savingPotRepository.findById(dto.getSavingPotId())
                    .orElseThrow(() -> new ResourceNotFoundException("SavingPot", "id", dto.getSavingPotId()));
        }

        TransactionMapper.updateEntity(transaction, dto, budget, savingPot);

        // Recalculate budgets before saving
        updateBudgetCalculations(oldBudget, oldAmount, oldType, budget, transaction.getAmount(), transaction.getType());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        return TransactionMapper.toResponse(updatedTransaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        // Update budget before deleting transaction
        if (transaction.getBudget() != null && transaction.getType() == TransactionType.EXPENSE) {
            Budget budget = transaction.getBudget();
            budget.subtractFromSpent(transaction.getAmount());
            budget.decrementTransactionCount();
            budgetRepository.save(budget);
        }

        transactionRepository.delete(transaction);
    }

    /**
     * Helper method to update budget calculations when transaction changes.
     * Handles all cases: budget change, amount change, type change, or combination.
     */
    private void updateBudgetCalculations(
            Budget oldBudget, BigDecimal oldAmount, TransactionType oldType,
            Budget newBudget, BigDecimal newAmount, TransactionType newType) {

        // Case 1: Remove from old budget (if it was an expense)
        if (oldBudget != null && oldType == TransactionType.EXPENSE) {
            oldBudget.subtractFromSpent(oldAmount);
            oldBudget.decrementTransactionCount();
            budgetRepository.save(oldBudget);
        }

        // Case 2: Add to new budget (if it's an expense)
        if (newBudget != null && newType == TransactionType.EXPENSE) {
            // Check if it's the same budget (just updating amount)
            if (oldBudget != null && oldBudget.getId().equals(newBudget.getId()) && oldType == TransactionType.EXPENSE) {
                // Same budget, same type - just update the difference
                BigDecimal difference = newAmount.subtract(oldAmount);
                newBudget.addToSpent(difference);
                // Count stays the same, no need to increment again
            } else {
                // Different budget or type changed to expense
                newBudget.addToSpent(newAmount);
                newBudget.incrementTransactionCount();
            }
            budgetRepository.save(newBudget);
        }
    }
}
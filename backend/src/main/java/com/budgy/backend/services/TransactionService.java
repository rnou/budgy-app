package com.budgy.backend.services;

import com.budgy.backend.dto.TransactionDTO;
import com.budgy.backend.dto.response.TransactionResponseDTO;
import com.budgy.backend.entities.Budget;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.Transaction;
import com.budgy.backend.entities.User;
import com.budgy.backend.enums.TransactionType;
import com.budgy.backend.exceptions.BadRequestException;
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

        // Check for invalid combinations
        validateTransactionType(dto);

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

        // ==================== UPDATE USER BALANCE ====================
        updateUserBalanceOnCreate(user, savedTransaction);
        userRepository.save(user);
        // =================================================================

        // UPDATE BUDGET if expense
        if (budget != null && transaction.getType() == TransactionType.EXPENSE) {
            budget.addToSpent(transaction.getAmount());
            budget.incrementTransactionCount();
            budgetRepository.save(budget);
        }

        // UPDATE SAVING POT if saving/withdraw
        if (savingPot != null) {
            if (transaction.getType() == TransactionType.SAVING) {
                savingPot.addToSaved(transaction.getAmount());
                savingPot.incrementTransactionCount();
                savingPotRepository.save(savingPot);
            } else if (transaction.getType() == TransactionType.WITHDRAW) {
                savingPot.subtractFromSaved(transaction.getAmount());
                savingPot.incrementTransactionCount();
                savingPotRepository.save(savingPot);
            }
        }

        return TransactionMapper.toResponse(savedTransaction);
    }

    public TransactionResponseDTO updateTransaction(Long id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        // Check for invalid combinations
        validateTransactionType(dto);

        User user = transaction.getUser();

        // Store old values for recalculation
        Budget oldBudget = transaction.getBudget();
        SavingPot oldSavingPot = transaction.getSavingPot();
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

        // ==================== UPDATE USER BALANCE ====================
        // Update balance BEFORE changing the transaction entity
        TransactionType newType = TransactionType.valueOf(dto.getType().toUpperCase());
        BigDecimal newAmount = dto.getAmount();

        // For expenses, make sure amount is negative
        if (newType == TransactionType.EXPENSE && newAmount.compareTo(BigDecimal.ZERO) > 0) {
            newAmount = newAmount.negate();
        }

        updateUserBalanceOnUpdate(user, oldAmount, oldType, newAmount, newType);
        // =================================================================

        TransactionMapper.updateEntity(transaction, dto, budget, savingPot);

        // RECALCULATE BUDGETS
        updateBudgetCalculations(oldBudget, oldAmount, oldType, budget, transaction.getAmount(), transaction.getType());

        // RECALCULATE SAVING POTS
        updateSavingPotCalculations(oldSavingPot, oldAmount, oldType, savingPot, transaction.getAmount(), transaction.getType());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        // ==================== SAVE USER ====================
        userRepository.save(user);
        // =======================================================

        return TransactionMapper.toResponse(updatedTransaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        User user = transaction.getUser();

        // ==================== UPDATE USER BALANCE ====================
        updateUserBalanceOnDelete(user, transaction);
        userRepository.save(user);
        // =================================================================

        // UPDATE BUDGET before deleting
        if (transaction.getBudget() != null && transaction.getType() == TransactionType.EXPENSE) {
            Budget budget = transaction.getBudget();
            budget.subtractFromSpent(transaction.getAmount());
            budget.decrementTransactionCount();
            budgetRepository.save(budget);
        }

        // UPDATE SAVING POT before deleting
        if (transaction.getSavingPot() != null) {
            SavingPot savingPot = transaction.getSavingPot();

            if (transaction.getType() == TransactionType.SAVING) {
                savingPot.subtractFromSaved(transaction.getAmount());
            } else if (transaction.getType() == TransactionType.WITHDRAW) {
                savingPot.addToSaved(transaction.getAmount());  // Add back what was withdrawn
            }

            savingPot.decrementTransactionCount();
            savingPotRepository.save(savingPot);
        }

        transactionRepository.delete(transaction);
    }

    // ==================== VALIDATION ====================

    /**
     * Validates that transaction type matches the linked entity
     */
    private void validateTransactionType(TransactionDTO dto) {
        TransactionType type = TransactionType.valueOf(dto.getType().toUpperCase());

        // Rule 1: EXPENSE can only link to budgets
        if (type == TransactionType.EXPENSE && dto.getSavingPotId() != null) {
            throw new BadRequestException("EXPENSE transactions cannot be linked to saving pots. Use SAVING or WITHDRAW instead.");
        }

        // Rule 2: INCOME cannot link to budgets or pots
        if (type == TransactionType.INCOME && (dto.getBudgetId() != null || dto.getSavingPotId() != null)) {
            throw new BadRequestException("INCOME transactions cannot be linked to budgets or saving pots.");
        }

        // Rule 3: SAVING/WITHDRAW can only link to saving pots
        if ((type == TransactionType.SAVING || type == TransactionType.WITHDRAW)) {
            if (dto.getBudgetId() != null) {
                throw new BadRequestException("SAVING/WITHDRAW transactions cannot be linked to budgets.");
            }
            if (dto.getSavingPotId() == null) {
                throw new BadRequestException("SAVING/WITHDRAW transactions must be linked to a saving pot.");
            }
        }
    }

    // ==================== USER BALANCE METHODS ====================

    /**
     * Update user balance when creating a new transaction
     *
     * Transaction Type Impact on Balance:
     * - INCOME: Increases balance (amount is positive)
     * - EXPENSE: Decreases balance (amount is negative, stored as negative)
     * - SAVING: Decreases balance (moving money to pot)
     * - WITHDRAW: Increases balance (getting money from pot)
     */
    private void updateUserBalanceOnCreate(User user, Transaction transaction) {
        BigDecimal amount = transaction.getAmount();
        TransactionType type = transaction.getType();

        switch (type) {
            case INCOME:
                // Income increases balance
                user.addToBalance(amount);
                break;
            case EXPENSE:
                // Expense decreases balance
                user.subtractFromBalance(amount);
                break;
            case SAVING:
                // Saving decreases balance (moving money to saving pot)
                user.subtractFromBalance(amount);
                break;
            case WITHDRAW:
                // Withdraw increases balance (getting money from saving pot)
                user.addToBalance(amount);
                break;
        }
    }

    /**
     * Update user balance when updating a transaction
     * First revert the old transaction, then apply the new one
     */
    private void updateUserBalanceOnUpdate(User user, BigDecimal oldAmount, TransactionType oldType,
                                           BigDecimal newAmount, TransactionType newType) {
        // Revert old transaction impact
        switch (oldType) {
            case INCOME:
                user.subtractFromBalance(oldAmount);
                break;
            case EXPENSE:
                user.addToBalance(oldAmount);
                break;
            case SAVING:
                user.addToBalance(oldAmount);
                break;
            case WITHDRAW:
                user.subtractFromBalance(oldAmount);
                break;
        }

        // Apply new transaction impact
        switch (newType) {
            case INCOME:
                user.addToBalance(newAmount);
                break;
            case EXPENSE:
                user.subtractFromBalance(newAmount);
                break;
            case SAVING:
                user.subtractFromBalance(newAmount);
                break;
            case WITHDRAW:
                user.addToBalance(newAmount);
                break;
        }
    }

    /**
     * Update user balance when deleting a transaction
     * Revert the transaction's impact on balance
     */
    private void updateUserBalanceOnDelete(User user, Transaction transaction) {
        BigDecimal amount = transaction.getAmount();
        TransactionType type = transaction.getType();

        // Revert the transaction impact
        switch (type) {
            case INCOME:
                user.subtractFromBalance(amount);
                break;
            case EXPENSE:
                user.addToBalance(amount);
                break;
            case SAVING:
                user.addToBalance(amount);
                break;
            case WITHDRAW:
                user.subtractFromBalance(amount);
                break;
        }
    }

    // ==================== BUDGET/POT METHODS ====================

    /**
     * Helper method to update budget calculations when transaction changes
     */
    private void updateBudgetCalculations(
            Budget oldBudget, BigDecimal oldAmount, TransactionType oldType,
            Budget newBudget, BigDecimal newAmount, TransactionType newType) {

        // Remove from old budget (if it was an expense)
        if (oldBudget != null && oldType == TransactionType.EXPENSE) {
            oldBudget.subtractFromSpent(oldAmount);
            oldBudget.decrementTransactionCount();
            budgetRepository.save(oldBudget);
        }

        // Add to new budget (if it's an expense)
        if (newBudget != null && newType == TransactionType.EXPENSE) {
            // Check if it's the same budget (just updating amount)
            if (oldBudget != null && oldBudget.getId().equals(newBudget.getId()) && oldType == TransactionType.EXPENSE) {
                // Same budget, same type - just update the difference
                BigDecimal difference = newAmount.subtract(oldAmount);
                newBudget.addToSpent(difference);
                // Count stays the same
            } else {
                // Different budget or type changed to expense
                newBudget.addToSpent(newAmount);
                newBudget.incrementTransactionCount();
            }
            budgetRepository.save(newBudget);
        }
    }

    /**
     * Helper method to update saving pot calculations when transaction changes
     */
    private void updateSavingPotCalculations(
            SavingPot oldPot, BigDecimal oldAmount, TransactionType oldType,
            SavingPot newPot, BigDecimal newAmount, TransactionType newType) {

        // Remove from old pot
        if (oldPot != null) {
            if (oldType == TransactionType.SAVING) {
                oldPot.subtractFromSaved(oldAmount);
            } else if (oldType == TransactionType.WITHDRAW) {
                oldPot.addToSaved(oldAmount);  // Add back what was withdrawn
            }
            oldPot.decrementTransactionCount();
            savingPotRepository.save(oldPot);
        }

        // Add to new pot
        if (newPot != null) {
            // Check if it's the same pot (just updating amount)
            if (oldPot != null && oldPot.getId().equals(newPot.getId()) && oldType == newType) {
                // Same pot, same type - just update the difference
                BigDecimal difference = newAmount.subtract(oldAmount);
                if (newType == TransactionType.SAVING) {
                    newPot.addToSaved(difference);
                } else if (newType == TransactionType.WITHDRAW) {
                    newPot.subtractFromSaved(difference);
                }
                // Count stays the same
            } else {
                // Different pot or type changed
                if (newType == TransactionType.SAVING) {
                    newPot.addToSaved(newAmount);
                } else if (newType == TransactionType.WITHDRAW) {
                    newPot.subtractFromSaved(newAmount);
                }
                newPot.incrementTransactionCount();
            }
            savingPotRepository.save(newPot);
        }
    }
}
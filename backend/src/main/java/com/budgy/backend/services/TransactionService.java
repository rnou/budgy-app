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

        return TransactionMapper.toResponse(savedTransaction);
    }

    public TransactionResponseDTO updateTransaction(Long id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

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
        Transaction updatedTransaction = transactionRepository.save(transaction);

        return TransactionMapper.toResponse(updatedTransaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        transactionRepository.delete(transaction);
    }
}

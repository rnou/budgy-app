package com.budgy.backend.mappers;

import com.budgy.backend.dto.TransactionDTO;
import com.budgy.backend.dto.response.TransactionResponseDTO;
import com.budgy.backend.entities.Budget;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.Transaction;
import com.budgy.backend.entities.User;
import com.budgy.backend.enums.TransactionType;

public class TransactionMapper {

    // Entity → Response DTO
    public static TransactionResponseDTO toResponse(Transaction transaction) {
        return TransactionResponseDTO.builder()
                .id(transaction.getId())
                .name(transaction.getName())
                .transactionDate(transaction.getTransactionDate())
                .amount(transaction.getAmount())
                .category(transaction.getCategory())
                .type(transaction.getType().name())
                .icon(transaction.getIcon())
                .color(transaction.getColor())
                .budgetId(transaction.getBudget() != null ? transaction.getBudget().getId() : null)
                .savingPotId(transaction.getSavingPot() != null ? transaction.getSavingPot().getId() : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    // Request DTO → Entity
    public static Transaction toEntity(TransactionDTO dto, User user, Budget budget, SavingPot savingPot) {
        Transaction transaction = new Transaction();
        transaction.setName(dto.getName());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setType(TransactionType.valueOf(dto.getType().toUpperCase()));
        transaction.setIcon(dto.getIcon());
        transaction.setColor(dto.getColor());
        transaction.setUser(user);
        transaction.setBudget(budget);
        transaction.setSavingPot(savingPot);
        return transaction;
    }

    // Update existing entity from DTO
    public static void updateEntity(Transaction transaction, TransactionDTO dto, Budget budget, SavingPot savingPot) {
        transaction.setName(dto.getName());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setType(TransactionType.valueOf(dto.getType().toUpperCase()));
        transaction.setIcon(dto.getIcon());
        transaction.setColor(dto.getColor());
        transaction.setBudget(budget);
        transaction.setSavingPot(savingPot);
    }
}
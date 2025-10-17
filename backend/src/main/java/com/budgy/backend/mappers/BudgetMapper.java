package com.budgy.backend.mappers;

import com.budgy.backend.dto.BudgetDTO;
import com.budgy.backend.dto.response.BudgetResponseDTO;
import com.budgy.backend.entities.Budget;
import com.budgy.backend.entities.User;

public class BudgetMapper {

    // Entity → Response DTO
    public static BudgetResponseDTO toResponse(Budget budget) {
        return BudgetResponseDTO.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .spent(budget.getSpent())
                .limitAmount(budget.getLimitAmount())
                .transactionCount(budget.getTransactionCount())
                .color(budget.getColor())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    // Request DTO → Entity
    public static Budget toEntity(BudgetDTO dto, User user) {
        Budget budget = new Budget();
        budget.setCategory(dto.getCategory());
        budget.setLimitAmount(dto.getLimitAmount());
        budget.setColor(dto.getColor());
        budget.setUser(user);
        return budget;
    }

    // Update existing entity from DTO
    public static void updateEntity(Budget budget, BudgetDTO dto) {
        budget.setCategory(dto.getCategory());
        budget.setLimitAmount(dto.getLimitAmount());
        budget.setColor(dto.getColor());
    }
}
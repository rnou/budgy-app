package com.budgy.backend.mappers;

import com.budgy.backend.dto.SavingPotDTO;
import com.budgy.backend.dto.response.SavingPotResponseDTO;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.User;

public class SavingPotMapper {

    // Entity → Response DTO
    public static SavingPotResponseDTO toResponse(SavingPot savingPot) {
        return SavingPotResponseDTO.builder()
                .id(savingPot.getId())
                .name(savingPot.getName())
                .saved(savingPot.getSaved())
                .goal(savingPot.getGoal())
                .transactionCount(savingPot.getTransactionCount())
                .icon(savingPot.getIcon())
                .color(savingPot.getColor())
                .createdAt(savingPot.getCreatedAt())
                .updatedAt(savingPot.getUpdatedAt())
                .build();
    }

    // Request DTO → Entity
    public static SavingPot toEntity(SavingPotDTO dto, User user) {
        SavingPot savingPot = new SavingPot();
        savingPot.setName(dto.getName());
        savingPot.setGoal(dto.getGoal());
        savingPot.setIcon(dto.getIcon());
        savingPot.setColor(dto.getColor());
        savingPot.setUser(user);
        return savingPot;
    }

    // Update existing entity from DTO
    public static void updateEntity(SavingPot savingPot, SavingPotDTO dto) {
        savingPot.setName(dto.getName());
        savingPot.setGoal(dto.getGoal());
        savingPot.setIcon(dto.getIcon());
        savingPot.setColor(dto.getColor());
    }
}
package com.budgy.backend.mappers;

import com.budgy.backend.dto.RecurringBillDTO;
import com.budgy.backend.dto.response.RecurringBillResponseDTO;
import com.budgy.backend.enums.BillStatus;
import com.budgy.backend.entities.RecurringBill;
import com.budgy.backend.entities.User;

public class RecurringBillMapper {

    // Entity → Response DTO
    public static RecurringBillResponseDTO toResponse(RecurringBill bill) {
        return RecurringBillResponseDTO.builder()
                .id(bill.getId())
                .name(bill.getName())
                .amount(bill.getAmount())
                .dueDate(bill.getDueDate())
                .status(bill.getStatus().name())
                .category(bill.getCategory())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .build();
    }

    // Request DTO → Entity
    public static RecurringBill toEntity(RecurringBillDTO dto, User user) {
        RecurringBill bill = new RecurringBill();
        bill.setName(dto.getName());
        bill.setAmount(dto.getAmount());
        bill.setDueDate(dto.getDueDate());
        bill.setCategory(dto.getCategory());
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            bill.setStatus(BillStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        bill.setUser(user);
        return bill;
    }

    // Update existing entity from DTO
    public static void updateEntity(RecurringBill bill, RecurringBillDTO dto) {
        bill.setName(dto.getName());
        bill.setAmount(dto.getAmount());
        bill.setDueDate(dto.getDueDate());
        bill.setCategory(dto.getCategory());
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            bill.setStatus(BillStatus.valueOf(dto.getStatus().toUpperCase()));
        }
    }
}
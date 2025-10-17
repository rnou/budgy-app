package com.budgy.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDTO {
    private Long id;
    private String name;
    private LocalDate transactionDate;
    private BigDecimal amount;
    private String category;
    private String type;
    private String icon;
    private String color;
    private Long budgetId;
    private Long savingPotId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
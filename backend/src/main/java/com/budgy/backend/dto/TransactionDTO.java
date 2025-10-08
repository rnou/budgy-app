package com.budgy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Date is required")
    private LocalDate transactionDate;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Type is required")
    private String type; // INCOME or EXPENSE

    private String icon;
    private String color;
    private Long budgetId;
    private Long savingPotId;
}
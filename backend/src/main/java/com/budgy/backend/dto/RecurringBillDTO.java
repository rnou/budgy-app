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
public class RecurringBillDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotBlank(message = "Category is required")
    private String category;

    private String status; // PAID, PENDING, OVERDUE
}
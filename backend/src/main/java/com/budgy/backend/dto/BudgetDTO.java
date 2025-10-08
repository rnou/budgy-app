package com.budgy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Limit amount is required")
    private BigDecimal limitAmount;

    private String color;
}
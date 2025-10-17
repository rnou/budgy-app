package com.budgy.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponseDTO {
    private Long id;
    private String category;
    private BigDecimal spent;
    private BigDecimal limitAmount;
    private Integer transactionCount;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
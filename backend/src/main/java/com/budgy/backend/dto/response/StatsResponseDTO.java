package com.budgy.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponseDTO {
    private BigDecimal currentBalance;
    private BigDecimal income;
    private BigDecimal expenses;
    private BigDecimal savings;
}
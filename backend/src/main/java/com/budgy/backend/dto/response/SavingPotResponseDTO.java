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
public class SavingPotResponseDTO {
    private Long id;
    private String name;
    private BigDecimal saved;
    private BigDecimal goal;
    private String icon;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
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
public class SavingPotDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Goal is required")
    private BigDecimal goal;

    private String icon;
    private String color;
}
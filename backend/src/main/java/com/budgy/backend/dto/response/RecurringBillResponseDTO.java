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
public class RecurringBillResponseDTO {
    private Long id;
    private String name;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
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
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String initials;
    private BigDecimal currentBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
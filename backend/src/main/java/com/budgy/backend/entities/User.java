package com.budgy.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Column(length = 10)
    private String initials;

    @Column(name = "current_balance", precision = 10, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Budget> budgets = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavingPot> savingPots = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecurringBill> recurringBills = new ArrayList<>();

    /**
     * Generate initials before persisting to database
     */
    @PrePersist
    @PreUpdate
    public void generateInitialsBeforeSave() {
        if (this.initials == null || this.initials.isEmpty()) {
            this.initials = generateInitials(this.name);
        }
    }

    private String generateInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // ==================== BALANCE MANAGEMENT METHODS ====================

    /**
     * Add to current balance
     * Used for INCOME and WITHDRAW transactions (positive amounts)
     *
     * @param amount Amount to add (use absolute value)
     */
    public void addToBalance(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal absoluteAmount = amount.abs();
            this.currentBalance = this.currentBalance.add(absoluteAmount);
        }
    }

    /**
     * Subtract from current balance
     * Used for EXPENSE and SAVING transactions (negative amounts)
     *
     * @param amount Amount to subtract (use absolute value)
     */
    public void subtractFromBalance(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal absoluteAmount = amount.abs();
            this.currentBalance = this.currentBalance.subtract(absoluteAmount);
        }
    }

    /**
     * Update balance based on transaction type and amount
     * This is the main method to use when creating/updating/deleting transactions
     *
     * @param amount Amount of the transaction
     * @param isPositiveImpact true if this increases balance, false if it decreases
     */
    public void updateBalance(BigDecimal amount, boolean isPositiveImpact) {
        if (amount == null) return;

        if (isPositiveImpact) {
            addToBalance(amount);
        } else {
            subtractFromBalance(amount);
        }
    }
}
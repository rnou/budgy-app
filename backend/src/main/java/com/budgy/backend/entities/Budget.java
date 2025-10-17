package com.budgy.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String category;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal spent = BigDecimal.ZERO;

    @NotNull
    @Column(name = "limit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "transaction_count", nullable = false)
    private Integer transactionCount = 0;

    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL)
    private List<Transaction> transactions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void incrementTransactionCount() {
        this.transactionCount++;
    }

    public void decrementTransactionCount() {
        if (this.transactionCount > 0) {
            this.transactionCount--;
        }
    }

    public void addToSpent(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            // Use absolute value for expenses (they might be stored as negative)
            BigDecimal absoluteAmount = amount.abs();
            this.spent = this.spent.add(absoluteAmount);
        }
    }

    public void subtractFromSpent(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            // Use absolute value
            BigDecimal absoluteAmount = amount.abs();
            this.spent = this.spent.subtract(absoluteAmount);

            // Prevent negative spent
            if (this.spent.compareTo(BigDecimal.ZERO) < 0) {
                this.spent = BigDecimal.ZERO;
            }
        }
    }
}
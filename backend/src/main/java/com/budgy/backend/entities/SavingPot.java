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
@Table(name = "saving_pots")
public class SavingPot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal saved = BigDecimal.ZERO;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal goal;

    @Column(name = "transaction_count", nullable = false)
    private Integer transactionCount = 0;

    private String icon;

    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "savingPot", cascade = CascadeType.ALL)
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

    public void addToSaved(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            // Use absolute value (amounts might be stored as negative)
            BigDecimal absoluteAmount = amount.abs();
            this.saved = this.saved.add(absoluteAmount);
        }
    }

    public void subtractFromSaved(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            // Use absolute value
            BigDecimal absoluteAmount = amount.abs();
            this.saved = this.saved.subtract(absoluteAmount);

            // Prevent negative saved
            if (this.saved.compareTo(BigDecimal.ZERO) < 0) {
                this.saved = BigDecimal.ZERO;
            }
        }
    }
}
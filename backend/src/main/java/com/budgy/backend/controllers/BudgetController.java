package com.budgy.backend.controllers;

import com.budgy.backend.dto.BudgetDTO;
import com.budgy.backend.dto.response.BudgetResponseDTO;
import com.budgy.backend.services.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponseDTO>> getAllBudgetsByUser(@PathVariable Long userId) {
        List<BudgetResponseDTO> budgets = budgetService.getAllBudgetsByUser(userId);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponseDTO> getBudgetById(@PathVariable Long budgetId) {
        BudgetResponseDTO budget = budgetService.getBudgetById(budgetId);
        return ResponseEntity.ok(budget);
    }

    @PostMapping
    public ResponseEntity<BudgetResponseDTO> createBudget(
            @PathVariable Long userId,
            @Valid @RequestBody BudgetDTO budgetDTO) {
        BudgetResponseDTO budget = budgetService.createBudget(userId, budgetDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponseDTO> updateBudget(
            @PathVariable Long budgetId,
            @Valid @RequestBody BudgetDTO budgetDTO) {
        BudgetResponseDTO budget = budgetService.updateBudget(budgetId, budgetDTO);
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long budgetId) {
        budgetService.deleteBudget(budgetId);
        return ResponseEntity.noContent().build();
    }
}
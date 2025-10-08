package com.budgy.backend.controllers;

import com.budgy.backend.dto.TransactionDTO;
import com.budgy.backend.dto.response.TransactionResponseDTO;
import com.budgy.backend.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/users/{userId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionResponseDTO>> getAllTransactionsByUser(@PathVariable Long userId) {
        List<TransactionResponseDTO> transactions = transactionService.getAllTransactionsByUser(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactionsByType(
            @PathVariable Long userId,
            @PathVariable String type) {
        List<TransactionResponseDTO> transactions = transactionService.getTransactionsByUserAndType(userId, type);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactionsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TransactionResponseDTO> transactions = transactionService.getTransactionsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponseDTO> getTransactionById(@PathVariable Long transactionId) {
        TransactionResponseDTO transaction = transactionService.getTransactionById(transactionId);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @PathVariable Long userId,
            @Valid @RequestBody TransactionDTO transactionDTO) {
        TransactionResponseDTO transaction = transactionService.createTransaction(userId, transactionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionResponseDTO> updateTransaction(
            @PathVariable Long transactionId,
            @Valid @RequestBody TransactionDTO transactionDTO) {
        TransactionResponseDTO transaction = transactionService.updateTransaction(transactionId, transactionDTO);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long transactionId) {
        transactionService.deleteTransaction(transactionId);
        return ResponseEntity.noContent().build();
    }
}
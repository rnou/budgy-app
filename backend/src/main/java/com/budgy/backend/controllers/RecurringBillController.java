package com.budgy.backend.controllers;

import com.budgy.backend.dto.RecurringBillDTO;
import com.budgy.backend.dto.response.RecurringBillResponseDTO;
import com.budgy.backend.services.RecurringBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/users/{userId}/recurring-bills")
@RequiredArgsConstructor
public class RecurringBillController {

    private final RecurringBillService recurringBillService;

    @GetMapping
    public ResponseEntity<List<RecurringBillResponseDTO>> getAllBillsByUser(@PathVariable Long userId) {
        List<RecurringBillResponseDTO> bills = recurringBillService.getAllBillsByUser(userId);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RecurringBillResponseDTO>> getBillsByStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        List<RecurringBillResponseDTO> bills = recurringBillService.getBillsByUserAndStatus(userId, status);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<RecurringBillResponseDTO>> getUpcomingBills(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<RecurringBillResponseDTO> bills = recurringBillService.getUpcomingBills(userId, date);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{billId}")
    public ResponseEntity<RecurringBillResponseDTO> getBillById(@PathVariable Long billId) {
        RecurringBillResponseDTO bill = recurringBillService.getBillById(billId);
        return ResponseEntity.ok(bill);
    }

    @PostMapping
    public ResponseEntity<RecurringBillResponseDTO> createBill(
            @PathVariable Long userId,
            @Valid @RequestBody RecurringBillDTO billDTO) {
        RecurringBillResponseDTO bill = recurringBillService.createBill(userId, billDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(bill);
    }

    @PutMapping("/{billId}")
    public ResponseEntity<RecurringBillResponseDTO> updateBill(
            @PathVariable Long billId,
            @Valid @RequestBody RecurringBillDTO billDTO) {
        RecurringBillResponseDTO bill = recurringBillService.updateBill(billId, billDTO);
        return ResponseEntity.ok(bill);
    }

    @DeleteMapping("/{billId}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long billId) {
        recurringBillService.deleteBill(billId);
        return ResponseEntity.noContent().build();
    }
}
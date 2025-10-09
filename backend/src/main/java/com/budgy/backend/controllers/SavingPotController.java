package com.budgy.backend.controllers;

import com.budgy.backend.dto.SavingPotDTO;
import com.budgy.backend.dto.response.SavingPotResponseDTO;
import com.budgy.backend.services.SavingPotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/saving-pots")
@RequiredArgsConstructor
public class SavingPotController {

    private final SavingPotService savingPotService;

    @GetMapping
    public ResponseEntity<List<SavingPotResponseDTO>> getAllSavingPotsByUser(@PathVariable Long userId) {
        List<SavingPotResponseDTO> savingPots = savingPotService.getAllSavingPotsByUser(userId);
        return ResponseEntity.ok(savingPots);
    }

    @GetMapping("/{savingPotId}")
    public ResponseEntity<SavingPotResponseDTO> getSavingPotById(@PathVariable Long savingPotId) {
        SavingPotResponseDTO savingPot = savingPotService.getSavingPotById(savingPotId);
        return ResponseEntity.ok(savingPot);
    }

    @PostMapping
    public ResponseEntity<SavingPotResponseDTO> createSavingPot(
            @PathVariable Long userId,
            @Valid @RequestBody SavingPotDTO savingPotDTO) {
        SavingPotResponseDTO savingPot = savingPotService.createSavingPot(userId, savingPotDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savingPot);
    }

    @PutMapping("/{savingPotId}")
    public ResponseEntity<SavingPotResponseDTO> updateSavingPot(
            @PathVariable Long savingPotId,
            @Valid @RequestBody SavingPotDTO savingPotDTO) {
        SavingPotResponseDTO savingPot = savingPotService.updateSavingPot(savingPotId, savingPotDTO);
        return ResponseEntity.ok(savingPot);
    }

    @DeleteMapping("/{savingPotId}")
    public ResponseEntity<Void> deleteSavingPot(@PathVariable Long savingPotId) {
        savingPotService.deleteSavingPot(savingPotId);
        return ResponseEntity.noContent().build();
    }
}
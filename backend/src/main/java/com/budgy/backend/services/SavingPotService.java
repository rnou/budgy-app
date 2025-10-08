package com.budgy.backend.services;

import com.budgy.backend.dto.SavingPotDTO;
import com.budgy.backend.dto.response.SavingPotResponseDTO;
import com.budgy.backend.entities.SavingPot;
import com.budgy.backend.entities.User;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.mappers.SavingPotMapper;
import com.budgy.backend.repositories.SavingPotRepository;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SavingPotService {

    private final SavingPotRepository savingPotRepository;
    private final UserRepository userRepository;

    public List<SavingPotResponseDTO> getAllSavingPotsByUser(Long userId) {
        return savingPotRepository.findByUserId(userId).stream()
                .map(SavingPotMapper::toResponse)
                .collect(Collectors.toList());
    }

    public SavingPotResponseDTO getSavingPotById(Long id) {
        SavingPot savingPot = savingPotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingPot", "id", id));
        return SavingPotMapper.toResponse(savingPot);
    }

    public SavingPotResponseDTO createSavingPot(Long userId, SavingPotDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SavingPot savingPot = SavingPotMapper.toEntity(dto, user);
        SavingPot savedSavingPot = savingPotRepository.save(savingPot);

        return SavingPotMapper.toResponse(savedSavingPot);
    }

    public SavingPotResponseDTO updateSavingPot(Long id, SavingPotDTO dto) {
        SavingPot savingPot = savingPotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingPot", "id", id));

        SavingPotMapper.updateEntity(savingPot, dto);
        SavingPot updatedSavingPot = savingPotRepository.save(savingPot);

        return SavingPotMapper.toResponse(updatedSavingPot);
    }

    public void deleteSavingPot(Long id) {
        SavingPot savingPot = savingPotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavingPot", "id", id));
        savingPotRepository.delete(savingPot);
    }
}
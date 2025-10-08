package com.budgy.backend.services;

import com.budgy.backend.dto.BudgetDTO;
import com.budgy.backend.dto.response.BudgetResponseDTO;
import com.budgy.backend.entities.Budget;
import com.budgy.backend.entities.User;
import com.budgy.backend.exceptions.BadRequestException;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.mappers.BudgetMapper;
import com.budgy.backend.repositories.BudgetRepository;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public List<BudgetResponseDTO> getAllBudgetsByUser(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(BudgetMapper::toResponse)
                .collect(Collectors.toList());
    }

    public BudgetResponseDTO getBudgetById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        return BudgetMapper.toResponse(budget);
    }

    public BudgetResponseDTO createBudget(Long userId, BudgetDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if budget for this category already exists for this user
        if (budgetRepository.existsByUserIdAndCategory(userId, dto.getCategory())) {
            throw new BadRequestException("Budget for category '" + dto.getCategory() + "' already exists");
        }

        Budget budget = BudgetMapper.toEntity(dto, user);
        Budget savedBudget = budgetRepository.save(budget);

        return BudgetMapper.toResponse(savedBudget);
    }

    public BudgetResponseDTO updateBudget(Long id, BudgetDTO dto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        // Check if category is being changed and if it already exists
        if (!budget.getCategory().equals(dto.getCategory()) &&
                budgetRepository.existsByUserIdAndCategory(budget.getUser().getId(), dto.getCategory())) {
            throw new BadRequestException("Budget for category '" + dto.getCategory() + "' already exists");
        }

        BudgetMapper.updateEntity(budget, dto);
        Budget updatedBudget = budgetRepository.save(budget);

        return BudgetMapper.toResponse(updatedBudget);
    }

    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        budgetRepository.delete(budget);
    }
}
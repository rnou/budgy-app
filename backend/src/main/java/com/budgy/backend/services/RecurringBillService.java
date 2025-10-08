package com.budgy.backend.services;

import com.budgy.backend.dto.RecurringBillDTO;
import com.budgy.backend.dto.response.RecurringBillResponseDTO;
import com.budgy.backend.enums.BillStatus;
import com.budgy.backend.entities.RecurringBill;
import com.budgy.backend.entities.User;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.mappers.RecurringBillMapper;
import com.budgy.backend.repositories.RecurringBillRepository;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecurringBillService {

    private final RecurringBillRepository recurringBillRepository;
    private final UserRepository userRepository;

    public List<RecurringBillResponseDTO> getAllBillsByUser(Long userId) {
        return recurringBillRepository.findByUserId(userId).stream()
                .map(RecurringBillMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RecurringBillResponseDTO> getBillsByUserAndStatus(Long userId, String status) {
        BillStatus billStatus = BillStatus.valueOf(status.toUpperCase());
        return recurringBillRepository.findByUserIdAndStatus(userId, billStatus).stream()
                .map(RecurringBillMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RecurringBillResponseDTO> getUpcomingBills(Long userId, LocalDate date) {
        return recurringBillRepository.findUpcomingBills(userId, date).stream()
                .map(RecurringBillMapper::toResponse)
                .collect(Collectors.toList());
    }

    public RecurringBillResponseDTO getBillById(Long id) {
        RecurringBill bill = recurringBillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringBill", "id", id));
        return RecurringBillMapper.toResponse(bill);
    }

    public RecurringBillResponseDTO createBill(Long userId, RecurringBillDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        RecurringBill bill = RecurringBillMapper.toEntity(dto, user);
        RecurringBill savedBill = recurringBillRepository.save(bill);

        return RecurringBillMapper.toResponse(savedBill);
    }

    public RecurringBillResponseDTO updateBill(Long id, RecurringBillDTO dto) {
        RecurringBill bill = recurringBillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringBill", "id", id));

        RecurringBillMapper.updateEntity(bill, dto);
        RecurringBill updatedBill = recurringBillRepository.save(bill);

        return RecurringBillMapper.toResponse(updatedBill);
    }

    public void deleteBill(Long id) {
        RecurringBill bill = recurringBillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringBill", "id", id));
        recurringBillRepository.delete(bill);
    }
}
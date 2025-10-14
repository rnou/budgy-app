package com.budgy.backend.repositories;

import com.budgy.backend.entities.RecurringBill;
import com.budgy.backend.enums.BillStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringBillRepository extends CrudRepository<RecurringBill, Long> {

    @Query("SELECT r FROM RecurringBill r WHERE r.user.id = :userId")
    List<RecurringBill> findByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM RecurringBill r WHERE r.user.id = :userId AND r.status = :status")
    List<RecurringBill> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BillStatus status);

    @Query("SELECT r FROM RecurringBill r WHERE r.user.id = :userId AND r.dueDate <= :date ORDER BY r.dueDate ASC")
    List<RecurringBill> findUpcomingBills(@Param("userId") Long userId, @Param("date") LocalDate date);
}
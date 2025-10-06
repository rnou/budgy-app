package com.budgy.backend.repositories;

import com.budgy.backend.entities.SavingPot;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavingPotRepository extends CrudRepository<SavingPot, Long> {

    @Query("SELECT s FROM SavingPot s WHERE s.user.id = :userId")
    List<SavingPot> findByUserId(@Param("userId") Long userId);
}
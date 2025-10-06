package com.budgy.backend.repositories;

import com.budgy.backend.entities.Budget;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends CrudRepository<Budget, Long> {

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId")
    List<Budget> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category = :category")
    Optional<Budget> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Budget b WHERE b.user.id = :userId AND b.category = :category")
    boolean existsByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);
}
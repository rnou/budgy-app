package com.budgy.backend.repositories;

import com.budgy.backend.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends CrudRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmail(@NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email);
}
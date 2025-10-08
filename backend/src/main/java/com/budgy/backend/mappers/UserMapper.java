package com.budgy.backend.mappers;

import com.budgy.backend.dto.UserDTO;
import com.budgy.backend.dto.response.UserResponseDTO;
import com.budgy.backend.entities.User;

public class UserMapper {

    // Entity → Response DTO
    public static UserResponseDTO toResponse(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .initials(user.getInitials())
                .currentBalance(user.getCurrentBalance())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // Request DTO → Entity
    public static User toEntity(UserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // Will be hashed in service
        return user;
    }

    // Update existing entity from DTO
    public static void updateEntity(User user, UserDTO dto) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(dto.getPassword()); // Will be hashed in service
        }
    }
}
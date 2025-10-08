package com.budgy.backend.services;

import com.budgy.backend.dto.UserDTO;
import com.budgy.backend.dto.response.UserResponseDTO;
import com.budgy.backend.entities.User;
import com.budgy.backend.exceptions.BadRequestException;
import com.budgy.backend.exceptions.ResourceNotFoundException;
import com.budgy.backend.mappers.UserMapper;
import com.budgy.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponseDTO> getAllUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserMapper.toResponse(user);
    }

    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserMapper.toResponse(user);
    }

    public UserResponseDTO createUser(UserDTO dto) {
        // Check if email already exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        // Convert DTO to Entity
        User user = UserMapper.toEntity(dto);

        // TODO: Hash password before saving (add Spring Security later)
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save to database
        User savedUser = userRepository.save(user);

        // Convert Entity to Response DTO
        return UserMapper.toResponse(savedUser);
    }

    public UserResponseDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        // Update entity
        UserMapper.updateEntity(user, dto);

        // TODO: Hash password if it was changed
        // if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
        //     user.setPassword(passwordEncoder.encode(user.getPassword()));
        // }

        User updatedUser = userRepository.save(user);
        return UserMapper.toResponse(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }
}
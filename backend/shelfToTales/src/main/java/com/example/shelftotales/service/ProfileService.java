package com.example.shelftotales.service;

import com.example.shelftotales.dto.ProfileRequest;
import com.example.shelftotales.dto.ProfileResponse;
import com.example.shelftotales.model.User;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile() {
        return toResponse(AuthUtils.getCurrentUser(userRepository));
    }

    @Transactional
    public ProfileResponse updateProfile(ProfileRequest request) {
        User user = AuthUtils.getCurrentUser(userRepository);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(userRepository.save(user));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId()).email(user.getEmail())
                .fullName(user.getFullName()).bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt()).updatedAt(user.getUpdatedAt())
                .build();
    }
}
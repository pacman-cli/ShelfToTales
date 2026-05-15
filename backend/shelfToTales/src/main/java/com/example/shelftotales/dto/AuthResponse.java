package com.example.shelftotales.dto;

import com.example.shelftotales.model.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String profileImageUrl;
    private Role role;
}

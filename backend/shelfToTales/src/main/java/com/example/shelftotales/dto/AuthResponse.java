package com.example.shelftotales.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private String profileImageUrl;
    private com.example.shelftotales.model.Role role;
}

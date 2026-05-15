package com.example.shelftotales.dto;

import com.example.shelftotales.model.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    private String idToken;
}

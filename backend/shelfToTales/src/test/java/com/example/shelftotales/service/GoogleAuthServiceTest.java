package com.example.shelftotales.service;

import com.example.shelftotales.auth.application.AuthResponse;
import com.example.shelftotales.auth.application.GoogleAuthService;
import com.example.shelftotales.auth.domain.AuthProvider;
import com.example.shelftotales.auth.domain.Role;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.shared.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private GoogleAuthService googleAuthService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testGoogleAuthSuccessNewUser() {
        String token = "mock-google-token";
        Map<String, Object> payload = new HashMap<>();
        payload.put("sub", "google-id-123");
        payload.put("email", "newuser@example.com");
        payload.put("name", "New Google User");
        payload.put("picture", "http://image.com/pic.jpg");

        // Mock restTemplate POST request
        when(restTemplate.postForObject(
                eq("https://oauth2.googleapis.com/tokeninfo"),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(payload);

        when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token");

        AuthResponse response = googleAuthService.authenticateWithGoogle(token);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("newuser@example.com", response.getEmail());
        assertEquals("New Google User", response.getFullName());

        // Verify POST payload contains token in body
        ArgumentCaptor<HttpEntity<MultiValueMap<String, String>>> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForObject(
                eq("https://oauth2.googleapis.com/tokeninfo"),
                requestCaptor.capture(),
                eq(Map.class)
        );

        HttpEntity<MultiValueMap<String, String>> capturedRequest = requestCaptor.getValue();
        assertNotNull(capturedRequest);
        assertEquals(token, capturedRequest.getBody().getFirst("id_token"));
    }
}

package com.example.shelftotales.auth.presentation;

import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.bookshelf.domain.*;

import com.example.shelftotales.auth.application.AuthResponse;
import com.example.shelftotales.auth.application.GoogleAuthRequest;
import com.example.shelftotales.auth.application.LoginRequest;
import com.example.shelftotales.auth.application.RegisterRequest;
import com.example.shelftotales.auth.application.AuthService;
import com.example.shelftotales.auth.application.GoogleAuthService;
import com.example.shelftotales.shared.util.TokenBlacklist;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, register, and Google SSO")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final TokenBlacklist tokenBlacklist;

    @PostMapping("/register")
    @Operation(summary = "Register with email and password")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        AuthResponse authResponse = authService.register(request);
        setTokenCookie(httpRequest, httpResponse, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        AuthResponse authResponse = authService.login(request);
        setTokenCookie(httpRequest, httpResponse, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/google")
    @Operation(summary = "Login or register with Google ID token")
    public ResponseEntity<AuthResponse> googleAuth(
            @Valid @RequestBody GoogleAuthRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        AuthResponse authResponse = googleAuthService.authenticateWithGoogle(request.getIdToken());
        setTokenCookie(httpRequest, httpResponse, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate token")
    public ResponseEntity<Void> logout(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        String token = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (token == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        if (token != null) {
            tokenBlacklist.add(token);
        }
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }

    private void setTokenCookie(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            String token) {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

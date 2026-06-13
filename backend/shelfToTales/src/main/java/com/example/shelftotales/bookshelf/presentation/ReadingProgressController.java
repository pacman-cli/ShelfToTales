package com.example.shelftotales.bookshelf.presentation;

import com.example.shelftotales.bookshelf.application.ReadingProgressRequest;
import com.example.shelftotales.bookshelf.application.ReadingProgressService;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reading-progress")
@RequiredArgsConstructor
@Tag(name = "Reading Progress", description = "Per-user, per-book page position")
public class ReadingProgressController {

    private final ReadingProgressService progressService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current user's reading progress for a book")
    public ResponseEntity<ReadingProgressService.Progress> get(
            @RequestParam("bookId") Long bookId) {
        Long userId = requireUserId();
        return ResponseEntity.ok(progressService.getProgress(userId, bookId));
    }

    @PatchMapping
    @Operation(summary = "Update current user's reading progress for a book")
    public ResponseEntity<ReadingProgressService.Progress> save(
            @RequestParam("bookId") Long bookId,
            @Valid @RequestBody ReadingProgressRequest body) {
        Long userId = requireUserId();
        return ResponseEntity.ok(progressService.saveProgress(userId, bookId, body.currentPage()));
    }

    private Long requireUserId() {
        return AuthUtils.getCurrentUser(userRepository).getId();
    }
}

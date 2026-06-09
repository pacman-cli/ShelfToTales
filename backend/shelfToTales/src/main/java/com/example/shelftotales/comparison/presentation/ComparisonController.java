package com.example.shelftotales.comparison.presentation;

import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.comparison.application.ComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comparison")
@RequiredArgsConstructor
@Tag(name = "Comparison", description = "Authenticated user book comparison list management")
public class ComparisonController {
    private final ComparisonService comparisonService;

    @GetMapping
    @Operation(summary = "Get current user's comparison list")
    public ResponseEntity<List<BookResponse>> getComparisonList() {
        return ResponseEntity.ok(comparisonService.getUserComparisonList());
    }

    @PostMapping("/{bookId}")
    @Operation(summary = "Add a book to the comparison list")
    public ResponseEntity<Void> addToComparison(@PathVariable Long bookId) {
        comparisonService.addToComparison(bookId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{bookId}")
    @Operation(summary = "Remove a book from the comparison list")
    public ResponseEntity<Void> removeFromComparison(@PathVariable Long bookId) {
        comparisonService.removeFromComparison(bookId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Clear the comparison list")
    public ResponseEntity<Void> clearComparison() {
        comparisonService.clearComparison();
        return ResponseEntity.noContent().build();
    }
}

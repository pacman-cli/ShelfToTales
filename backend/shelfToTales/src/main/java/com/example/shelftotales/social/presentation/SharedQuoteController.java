package com.example.shelftotales.social.presentation;

import com.example.shelftotales.social.application.SharedQuoteRequest;
import com.example.shelftotales.social.application.SharedQuoteResponse;
import com.example.shelftotales.social.application.SharedQuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class SharedQuoteController {
    private final SharedQuoteService quoteService;

    @PostMapping("/{bookId}/quotes")
    public ResponseEntity<SharedQuoteResponse> shareQuote(
            @PathVariable Long bookId,
            @RequestBody SharedQuoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quoteService.shareQuote(bookId, request));
    }

    @GetMapping("/{bookId}/quotes")
    public ResponseEntity<List<SharedQuoteResponse>> getQuotesByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(quoteService.getQuotesByBook(bookId));
    }
}

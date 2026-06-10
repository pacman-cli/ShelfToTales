package com.example.shelftotales.ai.presentation;
import com.example.shelftotales.ai.application.*;

import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.bookshelf.domain.*;

import com.example.shelftotales.ai.application.SemanticSearchResponse;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.catalog.infrastructure.ImageHashService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SemanticSearchController {
    private final EmbeddingService embeddingService;
    private final ImageHashService imageHashService;
    private final BookRepository bookRepository;

    private record BookMatch(Book book, int distance) {}

    @GetMapping("/semantic")
    public ResponseEntity<SemanticSearchResponse> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        List<Map.Entry<Book, Double>> results = embeddingService.searchSimilar(q, limit, null);
        List<SemanticSearchResponse.SearchResult> searchResults = results.stream()
                .map(e -> SemanticSearchResponse.SearchResult.builder()
                        .bookId(e.getKey().getId()).title(e.getKey().getTitle())
                        .author(e.getKey().getAuthor()).coverUrl(e.getKey().getCoverUrl())
                        .categoryName(e.getKey().getCategory() != null ? e.getKey().getCategory().getName() : null)
                        .score(e.getValue()).build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(SemanticSearchResponse.builder().query(q).results(searchResults).build());
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindex() {
        int count = embeddingService.reindexAll();
        return ResponseEntity.ok(Map.of("indexed", count, "message", "Embeddings generated for " + count + " books"));
    }

    @PostMapping("/image")
    public ResponseEntity<?> searchByImage(@RequestParam("file") MultipartFile file,
                                            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        try {
            long queryHash = imageHashService.computeDHash(file);

            List<Book> allBooks = bookRepository.findAll();

            List<BookMatch> matches = allBooks.stream()
                    .filter(book -> book.getCoverHash() != null)
                    .map(book -> new BookMatch(book, imageHashService.hammingDistance(queryHash, book.getCoverHash())))
                    .sorted(Comparator.comparingInt(BookMatch::distance))
                    .limit(limit)
                    .collect(Collectors.toList());

            List<Map<String, Object>> results = matches.stream()
                    .map(match -> {
                        Map<String, Object> result = new HashMap<>();
                        result.put("bookId", match.book().getId());
                        result.put("title", match.book().getTitle());
                        result.put("author", match.book().getAuthor());
                        result.put("coverUrl", match.book().getCoverUrl());
                        result.put("distance", match.distance());
                        return result;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("results", results, "queryHash", queryHash));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to process image: " + e.getMessage()));
        }
    }
}

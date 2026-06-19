package com.example.shelftotales.ai.presentation;

import com.example.shelftotales.ai.application.SearchAnalyticsService;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.shared.dto.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Anonymous clicks are intentionally NOT persisted: the search_clicks.user_id column
 * is NOT NULL and we are not changing the schema. Anonymous click tracking is logged
 * client-side (console) only. Authenticated clicks still go through SearchAnalyticsService.
 */
@RestController
@RequestMapping("/api/search/events")
@RequiredArgsConstructor
@Slf4j
public class SearchAnalyticsController {

    private final SearchAnalyticsService service;

    public record ClickEvent(Long bookId, String query, Integer position, String source) {}

    @PostMapping
    public ResponseEntity<?> record(
            @AuthenticationPrincipal(expression = "this") Object principal,
            @RequestBody ClickEvent event) {
        if (principal instanceof User user) {
            if (event == null || event.bookId() == null || event.query() == null
                    || event.query().isBlank() || event.position() == null || event.position() < 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse(
                        400, "Bad Request",
                        "Required: bookId, query (non-blank), position (>= 0). Optional: source."));
            }
            service.recordClick(user.getId(), event.bookId(), event.query(),
                    event.position(), event.source());
            return ResponseEntity.noContent().build();
        }
        // Anonymous: skip persist. Return 204 so the client does not surface an error;
        // client-side analytics (console) still record the click.
        return ResponseEntity.noContent().build();
    }
}
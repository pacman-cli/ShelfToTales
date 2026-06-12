package com.example.shelftotales.recommend;

import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RankingService rankingService;
    private final UserRepository userRepository;

    @GetMapping("/for-you")
    public ResponseEntity<List<Recommendation>> forYou(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(rankingService.forUser(currentUserIdOrNull(), limit, Map.of()));
    }

    @GetMapping("/mood/{mood}")
    public ResponseEntity<List<Recommendation>> byMood(@PathVariable String mood,
                                                        @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(rankingService.forMood(mood, limit));
    }

    @GetMapping("/similar/{bookId}")
    public ResponseEntity<List<Recommendation>> similar(@PathVariable Long bookId,
                                                        @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(rankingService.similar(bookId, limit));
    }

    private Long currentUserIdOrNull() {
        String email = AuthUtils.getCurrentUserEmailOrNull();
        if (email == null) return null;
        return userRepository.findByEmail(email).map(u -> u.getId()).orElse(null);
    }
}

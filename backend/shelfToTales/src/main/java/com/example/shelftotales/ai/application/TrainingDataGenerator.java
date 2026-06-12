package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.infrastructure.SpoilerAssessmentRepository;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingDataGenerator {

    private final ReviewRepository reviewRepository;
    private final SpoilerAssessmentRepository assessmentRepository;
    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.spoiler.training-dir:./training-data}")
    private String trainingDir;

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are a spoiler detection model for the book "%s" by %s.
            Genre: %s. Mood: %s.

            Classify book reviews as:
            - SAFE: No spoilers or plot details
            - MINOR_SPOILER: Hints about characters or events
            - MAJOR_SPOILER: Reveals key plot points, endings, or character deaths

            Respond with ONLY valid JSON:
            {
              "level": "SAFE" | "MINOR_SPOILER" | "MAJOR_SPOILER",
              "score": 0.0-1.0,
              "reasoning": "brief explanation"
            }
            """;

    /**
     * Generate JSONL training file for a specific book.
     * Uses existing spoiler assessments as labeled training data.
     *
     * @return path to the generated JSONL file
     */
    @Transactional(readOnly = true)
    public String generateForBook(Long bookId) throws IOException {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        // Get all reviews for this book that have been assessed
        List<Review> reviews = reviewRepository.findByBookId(bookId);

        // Get assessments for these reviews
        List<Long> reviewIds = reviews.stream()
                .map(Review::getId)
                .toList();

        List<SpoilerAssessment> assessments = assessmentRepository.findByReviewIds(reviewIds);

        // Build a map of reviewId -> assessment
        Map<Long, SpoilerAssessment> assessmentMap = new HashMap<>();
        for (SpoilerAssessment assessment : assessments) {
            assessmentMap.put(assessment.getReviewId(), assessment);
        }

        // Build the system prompt for this book
        String systemPrompt = buildSystemPrompt(book);

        // Generate training examples
        List<Map<String, Object>> trainingData = new ArrayList<>();

        for (Review review : reviews) {
            if (review.getComment() == null || review.getComment().isBlank()) {
                continue;
            }

            SpoilerAssessment assessment = assessmentMap.get(review.getId());
            SpoilerLevel level;
            double score;

            if (assessment != null) {
                level = assessment.getSpoilerLevel();
                score = assessment.getSpoilerScore().doubleValue();
            } else {
                // Use the review's own spoiler flag as fallback
                level = review.getSpoilerLevel() != null ? review.getSpoilerLevel() : SpoilerLevel.SAFE;
                score = level == SpoilerLevel.SAFE ? 0.1 : (level == SpoilerLevel.MINOR_SPOILER ? 0.5 : 0.9);
            }

            String reasoning = buildReasoning(review, level);

            Map<String, Object> example = Map.of(
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", review.getComment()),
                            Map.of("role", "assistant", "content", formatAssistantResponse(level, score, reasoning))
                    )
            );

            trainingData.add(example);
        }

        // Write to JSONL file
        Path dir = Path.of(trainingDir);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }

        Path filePath = dir.resolve("spoiler-train-" + bookId + ".jsonl");
        List<String> lines = new ArrayList<>();
        for (Map<String, Object> example : trainingData) {
            lines.add(objectMapper.writeValueAsString(example));
        }
        Files.write(filePath, lines);

        log.info("Generated {} training examples for book {} -> {}", trainingData.size(), bookId, filePath);
        return filePath.toAbsolutePath().toString();
    }

    /**
     * Generate a base training file from book metadata (before reviews exist).
     * Uses the book description to create synthetic training examples.
     */
    public String generateBaseTrainingData(Long bookId) throws IOException {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        String systemPrompt = buildSystemPrompt(book);

        // Create synthetic examples from book description
        List<Map<String, Object>> trainingData = new ArrayList<>();

        if (book.getDescription() != null && !book.getDescription().isBlank()) {
            // Example 1: SAFE review about the book
            trainingData.add(createExample(systemPrompt,
                    "This book was really well written. I enjoyed every page!",
                    "SAFE", 0.15, "General praise without plot details"));

            // Example 2: MAJOR_SPOILER example
            trainingData.add(createExample(systemPrompt,
                    "The ending was shocking when the main character died. I didn't expect that.",
                    "MAJOR_SPOILER", 0.90, "Reveals the main character's death"));

            // Example 3: MINOR_SPOILER example
            trainingData.add(createExample(systemPrompt,
                    "The story has some interesting twists that I didn't see coming.",
                    "MINOR_SPOILER", 0.40, "Hints at plot twists without revealing details"));
        }

        // Write to JSONL file
        Path dir = Path.of(trainingDir);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }

        Path filePath = dir.resolve("spoiler-train-" + bookId + "-base.jsonl");
        List<String> lines = new ArrayList<>();
        for (Map<String, Object> example : trainingData) {
            lines.add(objectMapper.writeValueAsString(example));
        }
        Files.write(filePath, lines);

        log.info("Generated {} base training examples for book {} -> {}", trainingData.size(), bookId, filePath);
        return filePath.toAbsolutePath().toString();
    }

    private Map<String, Object> createExample(String systemPrompt, String userContent,
                                               String level, double score, String reasoning) {
        return Map.of(
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userContent),
                        Map.of("role", "assistant", "content", formatAssistantResponse(
                                SpoilerLevel.valueOf(level), score, reasoning))
                )
        );
    }

    private String buildSystemPrompt(Book book) {
        String genre = book.getCategory() != null ? book.getCategory().getName() : "Unknown";
        String mood = book.getMoodTags() != null ? book.getMoodTags() : "General";
        return String.format(SYSTEM_PROMPT_TEMPLATE,
                book.getTitle(), book.getAuthor(), genre, mood);
    }

    private String buildReasoning(Review review, SpoilerLevel level) {
        if (level == SpoilerLevel.SAFE) {
            return "Review does not contain plot-specific details";
        } else if (level == SpoilerLevel.MINOR_SPOILER) {
            return "Review hints at events or character development";
        } else {
            return "Review contains explicit plot reveals or character fates";
        }
    }

    private String formatAssistantResponse(SpoilerLevel level, double score, String reasoning) {
        return String.format("{\"level\": \"%s\", \"score\": %.2f, \"reasoning\": \"%s\"}",
                level.name(), score, reasoning);
    }
}

package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.ai.infrastructure.SpoilerAssessmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrainingDataGeneratorTest {

    private ReviewRepository reviewRepository;
    private SpoilerAssessmentRepository assessmentRepository;
    private BookRepository bookRepository;
    private ObjectMapper objectMapper;
    private TrainingDataGenerator generator;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        reviewRepository = mock(ReviewRepository.class);
        assessmentRepository = mock(SpoilerAssessmentRepository.class);
        bookRepository = mock(BookRepository.class);
        objectMapper = new ObjectMapper();
        generator = new TrainingDataGenerator(reviewRepository, assessmentRepository, bookRepository, objectMapper);
        
        // Inject trainingDir using reflection or simple setter
        org.springframework.test.util.ReflectionTestUtils.setField(generator, "trainingDir", tempDir.toString());
    }

    @Test
    void testGenerateForBook_writesTrueJsonl() throws IOException {
        Book book = Book.builder().id(1L).title("Test Book").author("Author").build();
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        Review r1 = Review.builder().id(10L).comment("Spoiler here").spoilerLevel(SpoilerLevel.MAJOR_SPOILER).build();
        when(reviewRepository.findByBookId(1L)).thenReturn(List.of(r1));
        when(assessmentRepository.findByReviewIds(any())).thenReturn(List.of());

        String path = generator.generateForBook(1L);
        assertNotNull(path);

        List<String> lines = Files.readAllLines(Path.of(path));
        assertEquals(1, lines.size());
        // Ensure it is a single-line JSON object, not part of an array
        assertTrue(lines.get(0).startsWith("{"));
        assertTrue(lines.get(0).endsWith("}"));
        assertFalse(lines.get(0).contains("\n"));
    }
}

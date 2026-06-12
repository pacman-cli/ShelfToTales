package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.BookSpoilerModel;
import com.example.shelftotales.ai.infrastructure.BookSpoilerModelRepository;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookSpoilerModelServiceTest {

    private BookSpoilerModelRepository modelRepository;
    private ReviewRepository reviewRepository;
    private TrainingDataGenerator trainingDataGenerator;
    private RestTemplate restTemplate;
    private BookSpoilerModelService service;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        modelRepository = mock(BookSpoilerModelRepository.class);
        reviewRepository = mock(ReviewRepository.class);
        trainingDataGenerator = mock(TrainingDataGenerator.class);
        restTemplate = mock(RestTemplate.class);
        // This will cause a compilation error first, which is the expected RED state
        service = new BookSpoilerModelService(modelRepository, reviewRepository, trainingDataGenerator, restTemplate);
        
        ReflectionTestUtils.setField(service, "ollamaBaseUrl", "http://localhost:11434");
        ReflectionTestUtils.setField(service, "trainingDir", tempDir.toString());
    }

    @Test
    void testImportModelToOllama_success() throws Exception {
        BookSpoilerModel model = BookSpoilerModel.builder()
                .bookId(1L)
                .ollamaModelName("shelf-spoiler-book-1")
                .build();
        when(modelRepository.findByBookId(1L)).thenReturn(Optional.of(model));

        // Set up model GGUF path
        Path modelDir = tempDir.resolve("models/1");
        Files.createDirectories(modelDir);
        Path ggufFile = modelDir.resolve("unsloth.Q4_K_M.gguf");
        Files.writeString(ggufFile, "mock-gguf-content");

        when(restTemplate.postForEntity(eq("http://localhost:11434/api/create"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));

        assertDoesNotThrow(() -> service.importModelToOllama(1L));

        verify(restTemplate, times(1)).postForEntity(eq("http://localhost:11434/api/create"), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testImportModelToOllama_throwsFileNotFound() {
        BookSpoilerModel model = BookSpoilerModel.builder().bookId(2L).ollamaModelName("shelf-spoiler-book-2").build();
        when(modelRepository.findByBookId(2L)).thenReturn(Optional.of(model));

        assertThrows(FileNotFoundException.class, () -> service.importModelToOllama(2L));
    }
}

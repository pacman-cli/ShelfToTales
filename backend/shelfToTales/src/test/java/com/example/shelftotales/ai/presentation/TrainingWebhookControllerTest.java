package com.example.shelftotales.ai.presentation;

import com.example.shelftotales.ai.application.BookSpoilerModelService;
import com.example.shelftotales.ai.application.SpoilerModelRegistry;
import com.example.shelftotales.ai.application.TrainingDataGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TrainingWebhookControllerTest {

    private BookSpoilerModelService modelService;
    private SpoilerModelRegistry modelRegistry;
    private TrainingDataGenerator trainingDataGenerator;
    private MockMvc mockMvc;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        modelService = mock(BookSpoilerModelService.class);
        modelRegistry = mock(SpoilerModelRegistry.class);
        trainingDataGenerator = mock(TrainingDataGenerator.class);
        ObjectMapper objectMapper = new ObjectMapper();

        TrainingWebhookController controller = new TrainingWebhookController(
                modelService, modelRegistry, trainingDataGenerator, objectMapper);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "trainingDir", tempDir.toString());

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testManualImport_success() throws Exception {
        doNothing().when(modelService).importModelToOllama(1L);

        mockMvc.perform(post("/api/ai/webhooks/books/1/import-model"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void testManualImport_failure() throws Exception {
        doThrow(new RuntimeException("File not found")).when(modelService).importModelToOllama(1L);

        mockMvc.perform(post("/api/ai/webhooks/books/1/import-model"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    void testOnTrainingComplete_importSuccess() throws Exception {
        doNothing().when(modelService).importModelToOllama(1L);

        mockMvc.perform(post("/api/ai/webhooks/training-complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookId\":1,\"modelName\":\"shelf-spoiler-book-1\",\"ggufDriveFileId\":\"driveId\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.message").value("Model registered and imported into Ollama successfully"));

        verify(modelService).markTrainingComplete(1L, "driveId");
        verify(modelRegistry).invalidate(1L);
    }

    @Test
    void testOnTrainingComplete_importWarning() throws Exception {
        doThrow(new RuntimeException("Import failed")).when(modelService).importModelToOllama(1L);

        mockMvc.perform(post("/api/ai/webhooks/training-complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookId\":1,\"modelName\":\"shelf-spoiler-book-1\",\"ggufDriveFileId\":\"driveId\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("warning"))
                .andExpect(jsonPath("$.message").value("Model registered in DB, but local import to Ollama failed: Import failed. Sync/copy the GGUF file locally and call /import-model endpoint."));

        verify(modelService).markTrainingComplete(1L, "driveId");
        verify(modelRegistry).invalidate(1L);
    }

    @Test
    void testOnTrainingFailed() throws Exception {
        mockMvc.perform(post("/api/ai/webhooks/training-failed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookId\":1,\"reason\":\"Out of memory\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        verify(modelService).markTrainingFailed(1L, "Out of memory");
    }

    @Test
    void testGetTrainingData_fileExists() throws Exception {
        Path jsonlPath = tempDir.resolve("spoiler-train-1.jsonl");
        List<String> lines = List.of(
            "{\"text\":\"Review 1\",\"label\":\"SAFE\"}",
            "{\"text\":\"Review 2\",\"label\":\"MAJOR_SPOILER\"}"
        );
        Files.write(jsonlPath, lines);

        mockMvc.perform(get("/api/ai/webhooks/books/1/training-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").value(1))
                .andExpect(jsonPath("$.exampleCount").value(2))
                .andExpect(jsonPath("$.examples[0].text").value("Review 1"))
                .andExpect(jsonPath("$.examples[1].label").value("MAJOR_SPOILER"));
    }

    @Test
    void testGetTrainingData_fileDoesNotExist_generatorCalled() throws Exception {
        Path jsonlPath = tempDir.resolve("spoiler-train-2.jsonl");

        when(trainingDataGenerator.generateForBook(2L)).thenAnswer(invocation -> {
            List<String> lines = List.of(
                "{\"text\":\"Gen Review 1\",\"label\":\"MINOR_SPOILER\"}"
            );
            Files.write(jsonlPath, lines);
            return jsonlPath.toString();
        });

        mockMvc.perform(get("/api/ai/webhooks/books/2/training-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").value(2))
                .andExpect(jsonPath("$.exampleCount").value(1))
                .andExpect(jsonPath("$.examples[0].text").value("Gen Review 1"));

        verify(trainingDataGenerator).generateForBook(2L);
    }

    @Test
    void testGetTrainingData_failure() throws Exception {
        when(trainingDataGenerator.generateForBook(3L)).thenThrow(new RuntimeException("Gen failed"));

        mockMvc.perform(get("/api/ai/webhooks/books/3/training-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").value(3))
                .andExpect(jsonPath("$.exampleCount").value(0))
                .andExpect(jsonPath("$.examples").isEmpty())
                .andExpect(jsonPath("$.message").value("No training data available. Add more reviews first."));
    }
}

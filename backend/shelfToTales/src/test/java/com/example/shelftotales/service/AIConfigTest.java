package com.example.shelftotales.service;

import com.example.shelftotales.ai.infrastructure.AIConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AIConfigTest {

    private AIConfig aiConfig;
    private Resource mockModelResource;
    private Resource mockTokenizerResource;

    @BeforeEach
    void setUp() {
        aiConfig = new AIConfig();
        mockModelResource = mock(Resource.class);
        mockTokenizerResource = mock(Resource.class);
        ReflectionTestUtils.setField(aiConfig, "modelResource", mockModelResource);
        ReflectionTestUtils.setField(aiConfig, "tokenizerResource", mockTokenizerResource);
    }

    @Test
    void testGetResourcePathFromLocalFile(@TempDir Path tempDir) throws IOException {
        File localFile = tempDir.resolve("local-model.onnx").toFile();
        assertTrue(localFile.createNewFile());

        when(mockModelResource.getFile()).thenReturn(localFile);

        Path resolvedPath = ReflectionTestUtils.invokeMethod(aiConfig, "getResourcePath", mockModelResource, "prefix-", ".onnx");

        assertNotNull(resolvedPath);
        assertEquals(localFile.toPath(), resolvedPath);
        verify(mockModelResource, times(1)).getFile();
        verify(mockModelResource, never()).getInputStream();
    }

    @Test
    void testGetResourcePathFromJarStream(@TempDir Path tempDir) throws IOException {
        when(mockModelResource.getFile()).thenThrow(new IOException("Not on filesystem"));
        
        byte[] dummyContent = "dummy model data".getBytes();
        when(mockModelResource.getInputStream()).thenReturn(new ByteArrayInputStream(dummyContent));
        when(mockModelResource.getFilename()).thenReturn("all-MiniLM-L6-v2.onnx");

        Path resolvedPath = ReflectionTestUtils.invokeMethod(aiConfig, "getResourcePath", mockModelResource, "prefix-", ".onnx");

        assertNotNull(resolvedPath);
        assertTrue(resolvedPath.toFile().exists());
        assertTrue(resolvedPath.getFileName().toString().startsWith("prefix-"));
        assertTrue(resolvedPath.getFileName().toString().endsWith(".onnx"));

        byte[] readContent = java.nio.file.Files.readAllBytes(resolvedPath);
        assertArrayEquals(dummyContent, readContent);

        verify(mockModelResource, times(1)).getFile();
        verify(mockModelResource, times(1)).getInputStream();
        
        // Clean up
        resolvedPath.toFile().delete();
    }
}

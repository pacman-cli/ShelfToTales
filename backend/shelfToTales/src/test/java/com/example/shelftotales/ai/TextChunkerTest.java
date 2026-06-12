package com.example.shelftotales.ai.rag;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TextChunkerTest {

    private final TextChunker chunker = new TextChunker();

    @Test
    void shortTextProducesSingleChunk() {
        List<String> chunks = chunker.chunk("This is a single short sentence.", 200, 30);
        assertEquals(1, chunks.size());
    }

    @Test
    void longTextProducesMultipleChunks() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50; i++) sb.append("Sentence number ").append(i).append(". ");
        List<String> chunks = chunker.chunk(sb.toString(), 50, 10);
        assertTrue(chunks.size() > 1);
    }

    @Test
    void emptyTextReturnsEmpty() {
        assertTrue(chunker.chunk("", 100, 10).isEmpty());
        assertTrue(chunker.chunk(null, 100, 10).isEmpty());
    }

    @Test
    void chunksOverlap() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 30; i++) sb.append("Sentence ").append(i).append(". ");
        List<String> chunks = chunker.chunk(sb.toString(), 40, 10);
        assertTrue(chunks.size() >= 2);
        // The first word of chunk 2 should appear in chunk 1's tail (overlap).
        String firstOfSecond = chunks.get(1).split("\\s+")[0];
        assertTrue(chunks.get(0).contains(firstOfSecond));
    }

    @Test
    void tokenEstimateRoughlyMatchesWhitespace() {
        int tokens = chunker.estimateTokens("one two three four five");
        assertEquals(5, tokens);
    }
}

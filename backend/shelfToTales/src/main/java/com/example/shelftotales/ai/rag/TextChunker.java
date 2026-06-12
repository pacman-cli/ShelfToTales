package com.example.shelftotales.ai.rag;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Sentence-aware sliding window chunker.
 *
 * Splits text into sentences, then packs them into chunks of approximately
 * {@code targetTokens} tokens, with an overlap of {@code overlapTokens} to
 * preserve context across chunk boundaries. Token estimation is whitespace
 * based — adequate for embedding pre-filtering, not for exact BPE counts.
 */
@Component
public class TextChunker {

    private static final Pattern SENTENCE_BOUNDARY = Pattern.compile("(?<=[.!?])\\s+");

    public List<String> chunk(String text, int targetTokens, int overlapTokens) {
        if (text == null || text.isBlank()) return List.of();
        String[] sentences = SENTENCE_BOUNDARY.split(text.trim());
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int currentTokens = 0;

        for (String sentence : sentences) {
            int sentenceTokens = estimateTokens(sentence);
            // Always include at least one sentence per chunk, even if it overshoots.
            if (currentTokens > 0 && currentTokens + sentenceTokens > targetTokens) {
                chunks.add(current.toString().trim());
                // Build overlap from the tail of the previous chunk.
                String overlap = tailTokens(current.toString(), overlapTokens);
                current.setLength(0);
                if (!overlap.isEmpty()) {
                    current.append(overlap).append(' ');
                    currentTokens = estimateTokens(overlap);
                } else {
                    currentTokens = 0;
                }
            }
            if (current.length() > 0) current.append(' ');
            current.append(sentence);
            currentTokens += sentenceTokens;
        }
        if (current.length() > 0) chunks.add(current.toString().trim());
        return chunks;
    }

    public int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        Matcher m = Pattern.compile("\\S+").matcher(text);
        int tokens = 0;
        while (m.find()) tokens++;
        return tokens;
    }

    private String tailTokens(String text, int tokenBudget) {
        if (tokenBudget <= 0 || text == null) return "";
        String[] words = text.split("\\s+");
        if (words.length <= tokenBudget) return text;
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - tokenBudget; i < words.length; i++) {
            if (i > words.length - tokenBudget) sb.append(' ');
            sb.append(words[i]);
        }
        return sb.toString();
    }
}

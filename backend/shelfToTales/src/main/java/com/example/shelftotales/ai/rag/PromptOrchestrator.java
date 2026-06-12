package com.example.shelftotales.ai.rag;

import com.example.shelftotales.ai.domain.RetrievedChunk;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Assembles the system prompt for the chat LLM by combining the static
 * system prompt, retrieved RAG context, and the conversation history.
 *
 * Token budgets are enforced by simple word-count truncation, which keeps
 * latency predictable without pulling in a tokenizer dependency for the
 * budget step (the chat endpoint caps output tokens anyway).
 */
@Component
@RequiredArgsConstructor
public class PromptOrchestrator {

    private static final String RAG_SECTION_HEADER = "\n## Relevant Book Excerpts\n";

    @Value("${ai.rag.max-context-words:1200}")
    private int maxContextWords;

    public String build(String baseSystemPrompt, List<RetrievedChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) return baseSystemPrompt;
        StringBuilder sb = new StringBuilder(baseSystemPrompt).append(RAG_SECTION_HEADER);
        int used = 0;
        for (RetrievedChunk rc : chunks) {
            String text = rc.chunk().getText();
            int words = text.split("\\s+").length;
            if (used + words > maxContextWords) break;
            sb.append("- ").append(text).append('\n');
            used += words;
        }
        return sb.toString();
    }
}

package com.example.shelftotales.ai.rag;

import com.example.shelftotales.ai.application.AIService;
import com.example.shelftotales.ai.application.EmbeddingService;
import com.example.shelftotales.ai.domain.BookChunk;
import com.example.shelftotales.ai.domain.RetrievedChunk;
import com.example.shelftotales.ai.infrastructure.BookChunkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Retrieves relevant book chunks for a user query using pgvector (when
 * available) or a PL/pgSQL cosine fallback over the comma-separated
 * representation. Applies Maximal Marginal Relevance (MMR) to balance
 * similarity and diversity across the result list.
 */
@Service
@RequiredArgsConstructor
public class RagRetriever {

    private static final int CANDIDATE_POOL = 50;

    private final BookChunkRepository chunkRepository;
    private final EmbeddingService embeddingService;
    private final AIService aiService;
    private final JdbcTemplate jdbcTemplate;

    @Value("${ai.rag.lambda:0.7}")
    private double lambda;

    @Transactional(readOnly = true)
    public List<RetrievedChunk> retrieve(String query, int topK) {
        if (query == null || query.isBlank() || topK <= 0) return List.of();
        double[] queryVec = embeddingService.generateEmbedding(query);
        if (queryVec == null || queryVec.length == 0) return List.of();

        List<BookChunk> candidates;
        if (embeddingService.isPgVectorAvailable()) {
            String vectorStr = "[" + toCsv(queryVec) + "]";
            candidates = chunkRepository.searchVector(vectorStr, true, CANDIDATE_POOL);
        } else {
            // Fallback: scan up to CANDIDATE_POOL rows and score in memory.
            candidates = chunkRepository.findAll().stream().limit(CANDIDATE_POOL).toList();
        }

        // Score each candidate by cosine similarity.
        List<RetrievedChunk> scored = new ArrayList<>();
        for (BookChunk c : candidates) {
            if (c.getEmbedding() == null) continue;
            double score = aiService.calculateSimilarity(queryVec, c.getEmbedding());
            scored.add(new RetrievedChunk(c, score));
        }
        scored.sort((a, b) -> Double.compare(b.score(), a.score()));
        return mmrRerank(scored, topK);
    }

    private List<RetrievedChunk> mmrRerank(List<RetrievedChunk> ranked, int topK) {
        if (ranked.isEmpty() || topK <= 0) return List.of();
        List<RetrievedChunk> selected = new ArrayList<>();
        Set<Long> selectedBookIds = new HashSet<>();
        while (selected.size() < topK && !ranked.isEmpty()) {
            RetrievedChunk best = null;
            double bestScore = Double.NEGATIVE_INFINITY;
            for (RetrievedChunk c : ranked) {
                if (selectedBookIds.contains(c.chunk().getBookId())
                        && selectedBookIds.size() >= 2) {
                    // Light diversity penalty: skip if we've already picked from this book.
                    continue;
                }
                double mmr = lambda * c.score();
                if (!selected.isEmpty()) {
                    double maxSim = 0;
                    for (RetrievedChunk s : selected) {
                        double sim = aiService.calculateSimilarity(
                                c.chunk().getEmbedding(), s.chunk().getEmbedding());
                        if (sim > maxSim) maxSim = sim;
                    }
                    mmr -= (1 - lambda) * maxSim;
                }
                if (mmr > bestScore) {
                    bestScore = mmr;
                    best = c;
                }
            }
            if (best == null) break;
            selected.add(best);
            selectedBookIds.add(best.chunk().getBookId());
            ranked.remove(best);
        }
        return selected;
    }

    private String toCsv(double[] vec) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < vec.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vec[i]);
        }
        return sb.toString();
    }
}

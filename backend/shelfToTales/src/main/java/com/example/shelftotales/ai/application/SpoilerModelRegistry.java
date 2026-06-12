package com.example.shelftotales.ai.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe registry that resolves bookId to Ollama model name.
 * Caches active model names for fast lookup during review classification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SpoilerModelRegistry {

    private final BookSpoilerModelService modelService;

    /**
     * Cache: bookId -> model name
     * Populated on first access, invalidated when model is retrained.
     */
    private final Map<Long, String> modelCache = new ConcurrentHashMap<>();

    /**
     * Thread-local holder for the current bookId being classified.
     * Set by SpoilerDetectionService before calling the classifier.
     */
    private static final ThreadLocal<Long> CURRENT_BOOK_ID = new ThreadLocal<>();

    /**
     * Set the current bookId for the ongoing classification.
     * Called by SpoilerDetectionService before invoking the classifier.
     */
    public void setCurrentBookId(Long bookId) {
        CURRENT_BOOK_ID.set(bookId);
    }

    /**
     * Get the current bookId being classified.
     */
    public Long getCurrentBookId() {
        return CURRENT_BOOK_ID.get();
    }

    /**
     * Clear the current bookId (call after classification completes).
     */
    public void clearCurrentBookId() {
        CURRENT_BOOK_ID.remove();
    }

    /**
     * Get the Ollama model name for a book.
     * Returns the fine-tuned model if ACTIVE, or the generic fallback.
     */
    public String getModelName(Long bookId) {
        return modelCache.computeIfAbsent(bookId, id -> {
            String name = modelService.getModelName(id);
            log.debug("Resolved model for book {}: {}", id, name);
            return name;
        });
    }

    /**
     * Get the model name for the current thread's bookId.
     */
    public String getCurrentModelName() {
        Long bookId = CURRENT_BOOK_ID.get();
        if (bookId == null) {
            return "shelf-spoiler-detector";
        }
        return getModelName(bookId);
    }

    /**
     * Invalidate cache for a book (called after retraining).
     */
    public void invalidate(Long bookId) {
        modelCache.remove(bookId);
        log.info("Invalidated model cache for book {}", bookId);
    }

    /**
     * Check if a book has an active fine-tuned model.
     */
    public boolean hasActiveModel(Long bookId) {
        return modelService.hasActiveModel(bookId);
    }
}

package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.infrastructure.PdfExtractionService;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.event.BookUploadedEvent;
import com.example.shelftotales.ai.rag.EmbeddingIndexer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listens for BookUploadedEvent and triggers async ingestion:
 * 1. Extract PDF text from R2
 * 2. Index book content into PgVector for RAG
 * 3. Register book for spoiler model tracking
 * 4. Generate base training data from book metadata
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookIngestionListener {

    private final PdfExtractionService pdfExtractionService;
    private final EmbeddingIndexer embeddingIndexer;
    private final BookSpoilerModelService modelService;
    private final TrainingDataGenerator trainingDataGenerator;
    private final BookRepository bookRepository;

    /**
     * Handle book upload event asynchronously.
     * Extracts PDF text, indexes content, and registers for spoiler model training.
     */
    @EventListener
    @Async("bookIngestionExecutor")
    @Transactional
    public void handleBookUploaded(BookUploadedEvent event) {
        log.info("Starting async ingestion for book={} r2Key={}", event.bookId(), event.r2ObjectKey());

        try {
            // 1. Get book from database
            Book book = bookRepository.findById(event.bookId()).orElse(null);
            if (book == null) {
                log.error("Book not found for ingestion: {}", event.bookId());
                return;
            }

            // 2. Extract PDF text if available
            String pdfText = null;
            if (event.r2ObjectKey() != null && !event.r2ObjectKey().isBlank()) {
                try {
                    pdfText = pdfExtractionService.extractText(event.r2ObjectKey());
                    log.info("Extracted {} characters from PDF for book {}", pdfText.length(), event.bookId());
                } catch (Exception e) {
                    log.warn("Failed to extract PDF text for book {}: {}", event.bookId(), e.getMessage());
                    // Continue without PDF text - metadata is still useful
                }
            }

            // 3. Index book content into PgVector (uses metadata + description)
            try {
                embeddingIndexer.reindexBook(book);
                log.info("Indexed book {} into PgVector", event.bookId());
            } catch (Exception e) {
                log.warn("Failed to index book {} into PgVector: {}", event.bookId(), e.getMessage());
            }

            // 4. Register book for spoiler model tracking
            modelService.registerBook(event.bookId(), book.getTitle());

            // 5. Generate base training data from book metadata
            try {
                trainingDataGenerator.generateBaseTrainingData(event.bookId());
                log.info("Generated base training data for book {}", event.bookId());
            } catch (Exception e) {
                log.warn("Failed to generate base training data for book {}: {}",
                        event.bookId(), e.getMessage());
            }

            log.info("Completed async ingestion for book={}", event.bookId());

        } catch (Exception e) {
            log.error("Failed to ingest book {}: {}", event.bookId(), e.getMessage(), e);
        }
    }
}

package com.example.shelftotales.ai.rag;

import com.example.shelftotales.ai.application.EmbeddingService;
import com.example.shelftotales.ai.domain.BookChunk;
import com.example.shelftotales.ai.infrastructure.BookChunkRepository;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingIndexer {

    private static final int CHUNK_TARGET_TOKENS = 200;
    private static final int CHUNK_OVERLAP_TOKENS = 30;
    private static final int PAGE_SIZE = 50;

    private final BookRepository bookRepository;
    private final BookChunkRepository chunkRepository;
    private final TextChunker textChunker;
    private final EmbeddingService embeddingService;

    /**
     * Reindex all books: rebuild chunks and their embeddings.
     * Idempotent — chunks for a (book_id, chunk_index) are upserted.
     */
    @Transactional
    public int reindexAll() {
        int page = 0;
        int total = 0;
        Page<Book> books;
        do {
            books = bookRepository.findAll(PageRequest.of(page, PAGE_SIZE));
            for (Book book : books.getContent()) {
                reindexBook(book);
                total++;
            }
            page++;
        } while (books.hasNext());
        log.info("Reindexed {} books into chunks", total);
        return total;
    }

    @Transactional
    public int reindexBook(Book book) {
        // Wipe existing chunks for this book; safe because chunks are derivable.
        chunkRepository.findByBookIdOrderByChunkIndexAsc(book.getId())
                .forEach(chunkRepository::delete);

        String text = buildBookText(book);
        List<String> chunks = textChunker.chunk(text, CHUNK_TARGET_TOKENS, CHUNK_OVERLAP_TOKENS);
        int saved = 0;
        for (int i = 0; i < chunks.size(); i++) {
            String chunkText = chunks.get(i);
            double[] vector = embeddingService.generateEmbedding(chunkText);
            BookChunk chunk = BookChunk.builder()
                    .bookId(book.getId())
                    .chunkIndex(i)
                    .text(chunkText)
                    .tokenCount(textChunker.estimateTokens(chunkText))
                    .embedding(vector)
                    .build();
            chunkRepository.save(chunk);
            saved++;
        }
        return saved;
    }

    private String buildBookText(Book book) {
        StringBuilder sb = new StringBuilder();
        if (book.getTitle() != null) sb.append(book.getTitle()).append(". ");
        if (book.getAuthor() != null) sb.append("by ").append(book.getAuthor()).append(". ");
        if (book.getDescription() != null) sb.append(book.getDescription()).append(' ');
        if (book.getCategory() != null) sb.append("Genre: ").append(book.getCategory().getName()).append(". ");
        if (book.getMoodTags() != null) sb.append("Mood: ").append(book.getMoodTags()).append('.');
        return sb.toString();
    }
}

package com.example.shelftotales.social.application;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.event.QuoteSharedEvent;
import com.example.shelftotales.social.domain.SharedQuote;
import com.example.shelftotales.social.infrastructure.SharedQuoteRepository;
import com.example.shelftotales.shared.exception.ResourceNotFoundException;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharedQuoteService {
    private final SharedQuoteRepository quoteRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public SharedQuoteResponse shareQuote(Long bookId, SharedQuoteRequest request) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        SharedQuote quote = SharedQuote.builder()
                .user(user)
                .book(book)
                .quoteText(request.getQuoteText())
                .explanation(request.getExplanation())
                .themeStyle(request.getThemeStyle() != null ? request.getThemeStyle() : "sunset")
                .build();

        quote = quoteRepository.save(quote);

        // Publish event to generate activity feed card
        eventPublisher.publishEvent(new QuoteSharedEvent(user.getId(), quote.getId(), book.getTitle(), quote.getQuoteText(), quote.getThemeStyle()));

        return mapToResponse(quote);
    }

    @Transactional(readOnly = true)
    public List<SharedQuoteResponse> getQuotesByBook(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Book not found");
        }
        return quoteRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SharedQuoteResponse mapToResponse(SharedQuote q) {
        SharedQuoteResponse.UserSummary userSummary = SharedQuoteResponse.UserSummary.builder()
                .id(q.getUser().getId())
                .username(q.getUser().getUsername())
                .profileImageUrl(q.getUser().getProfileImageUrl())
                .build();

        return SharedQuoteResponse.builder()
                .id(q.getId())
                .bookId(q.getBook().getId())
                .bookTitle(q.getBook().getTitle())
                .bookAuthor(q.getBook().getAuthor())
                .quoteText(q.getQuoteText())
                .explanation(q.getExplanation())
                .themeStyle(q.getThemeStyle())
                .createdAt(q.getCreatedAt())
                .user(userSummary)
                .build();
    }
}

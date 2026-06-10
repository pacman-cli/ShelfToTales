package com.example.shelftotales.bookshelf.application.strategy;

import com.example.shelftotales.bookshelf.domain.ShelfBook;
import org.springframework.stereotype.Component;
import java.util.Set;

/**
 * Transition to WANT_TO_READ. Allowed from any status.
 */
@Component
public class WantToReadStrategy implements ReadingStatusTransitionStrategy {

    private static final Set<String> ALLOWED_FROM = Set.of("NOT_STARTED", "IN_PROGRESS", "PAUSED", "COMPLETED", "WANT_TO_READ");

    @Override
    public String getTargetStatus() {
        return "WANT_TO_READ";
    }

    @Override
    public boolean canTransitionFrom(String currentStatus) {
        return ALLOWED_FROM.contains(currentStatus);
    }

    @Override
    public void apply(ShelfBook shelfBook) {
        shelfBook.setReadingStatus("WANT_TO_READ");
    }
}

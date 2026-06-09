package com.example.shelftotales.event;

import lombok.Getter;

@Getter
public class QuoteSharedEvent extends DomainEvent {
    private final Long quoteId;
    private final String bookTitle;
    private final String quoteText;
    private final String themeStyle;

    public QuoteSharedEvent(Long actorId, Long quoteId, String bookTitle, String quoteText, String themeStyle) {
        super(actorId);
        this.quoteId = quoteId;
        this.bookTitle = bookTitle;
        this.quoteText = quoteText;
        this.themeStyle = themeStyle;
    }
}

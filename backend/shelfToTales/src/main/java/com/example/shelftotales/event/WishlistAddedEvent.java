package com.example.shelftotales.event;

import lombok.Getter;

@Getter
public class WishlistAddedEvent extends DomainEvent {
    private final Long bookId;

    public WishlistAddedEvent(Long actorId, Long bookId) {
        super(actorId);
        this.bookId = bookId;
    }
}

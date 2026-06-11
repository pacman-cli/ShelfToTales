package com.example.shelftotales.event;

import lombok.Getter;

@Getter
public class ExchangeCompletedEvent extends DomainEvent {
    private final Long exchangeId;

    public ExchangeCompletedEvent(Long actorId, Long exchangeId) {
        super(actorId);
        this.exchangeId = exchangeId;
    }
}

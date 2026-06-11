package com.example.shelftotales.event;

import lombok.Getter;

@Getter
public class BlogCreatedEvent extends DomainEvent {
    private final Long blogId;
    private final String title;
    private final String contentExcerpt;

    public BlogCreatedEvent(Long actorId, Long blogId, String title, String contentExcerpt) {
        super(actorId);
        this.blogId = blogId;
        this.title = title;
        this.contentExcerpt = contentExcerpt;
    }
}

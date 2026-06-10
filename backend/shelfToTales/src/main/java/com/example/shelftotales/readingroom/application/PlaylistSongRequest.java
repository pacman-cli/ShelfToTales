package com.example.shelftotales.readingroom.application;

import lombok.Data;

@Data
public class PlaylistSongRequest {
    private String title;
    private String artist;
    private Integer sortOrder;
}

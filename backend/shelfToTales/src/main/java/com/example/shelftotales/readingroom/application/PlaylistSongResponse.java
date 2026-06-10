package com.example.shelftotales.readingroom.application;

import com.example.shelftotales.readingroom.domain.PlaylistSong;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PlaylistSongResponse {
    private Long id;
    private String title;
    private String artist;
    private String fileUrl;
    private String coverUrl;
    private Integer durationSeconds;
    private Integer sortOrder;
    private String addedByName;
    private LocalDateTime createdAt;

    public static PlaylistSongResponse from(PlaylistSong song) {
        PlaylistSongResponse r = new PlaylistSongResponse();
        r.setId(song.getId());
        r.setTitle(song.getTitle());
        r.setArtist(song.getArtist());
        r.setFileUrl(song.getFileUrl());
        r.setCoverUrl(song.getCoverUrl());
        r.setDurationSeconds(song.getDurationSeconds());
        r.setSortOrder(song.getSortOrder());
        r.setAddedByName(song.getAddedBy() != null ? song.getAddedBy().getFullName() : null);
        r.setCreatedAt(song.getCreatedAt());
        return r;
    }
}

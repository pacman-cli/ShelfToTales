package com.example.shelftotales.readingroom.presentation;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.readingroom.application.PlaylistSongRequest;
import com.example.shelftotales.readingroom.application.PlaylistSongResponse;
import com.example.shelftotales.readingroom.application.PlaylistSongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistSongService playlistSongService;

    @GetMapping("/playlist/songs")
    public ResponseEntity<List<PlaylistSongResponse>> getAllSongs() {
        return ResponseEntity.ok(playlistSongService.getAllSongs());
    }

    @PostMapping("/admin/playlist/songs")
    public ResponseEntity<PlaylistSongResponse> addSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "artist", required = false) String artist,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            @AuthenticationPrincipal User user) {
        PlaylistSongResponse song = playlistSongService.addSong(file, title, artist, sortOrder, user);
        return ResponseEntity.ok(song);
    }

    @PutMapping("/admin/playlist/songs/{id}")
    public ResponseEntity<PlaylistSongResponse> updateSong(
            @PathVariable Long id,
            @RequestBody PlaylistSongRequest request) {
        return ResponseEntity.ok(playlistSongService.updateSong(id, request));
    }

    @DeleteMapping("/admin/playlist/songs/{id}")
    public ResponseEntity<Map<String, String>> deleteSong(@PathVariable Long id) {
        playlistSongService.deleteSong(id);
        return ResponseEntity.ok(Map.of("message", "Song deleted"));
    }
}

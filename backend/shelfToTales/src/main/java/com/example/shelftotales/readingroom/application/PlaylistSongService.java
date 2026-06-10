package com.example.shelftotales.readingroom.application;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.readingroom.domain.PlaylistSong;
import com.example.shelftotales.readingroom.infrastructure.PlaylistSongRepository;
import com.example.shelftotales.shared.config.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaylistSongService {

    private final PlaylistSongRepository playlistSongRepository;
    private final StorageService storageService;

    public List<PlaylistSongResponse> getAllSongs() {
        return playlistSongRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(PlaylistSongResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlaylistSongResponse addSong(MultipartFile file, String title, String artist,
                                         Integer sortOrder, User addedBy) {
        String url = storageService.upload(file, "playlist");

        PlaylistSong song = PlaylistSong.builder()
                .title(title)
                .artist(artist)
                .fileUrl(url)
                .sortOrder(sortOrder != null ? sortOrder : 0)
                .addedBy(addedBy)
                .build();

        PlaylistSong saved = playlistSongRepository.save(song);
        log.info("Added playlist song: {} by {}", title, addedBy.getFullName());
        return PlaylistSongResponse.from(saved);
    }

    @Transactional
    public PlaylistSongResponse updateSong(Long id, PlaylistSongRequest request) {
        PlaylistSong song = playlistSongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found: " + id));

        if (request.getTitle() != null) song.setTitle(request.getTitle());
        if (request.getArtist() != null) song.setArtist(request.getArtist());
        if (request.getSortOrder() != null) song.setSortOrder(request.getSortOrder());

        PlaylistSong saved = playlistSongRepository.save(song);
        return PlaylistSongResponse.from(saved);
    }

    @Transactional
    public void deleteSong(Long id) {
        if (!playlistSongRepository.existsById(id)) {
            throw new RuntimeException("Song not found: " + id);
        }
        playlistSongRepository.deleteById(id);
        log.info("Deleted playlist song: {}", id);
    }
}

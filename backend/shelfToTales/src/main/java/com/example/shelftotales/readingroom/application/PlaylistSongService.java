package com.example.shelftotales.readingroom.application;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.readingroom.domain.PlaylistSong;
import com.example.shelftotales.readingroom.infrastructure.PlaylistSongRepository;
import com.example.shelftotales.shared.config.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaylistSongService {

    private final PlaylistSongRepository playlistSongRepository;
    private final StorageService storageService;

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${storage.r2.bucket:shelftotales}")
    private String bucket;

    @Transactional(readOnly = true)
    public List<PlaylistSongResponse> getAllSongs() {
        return playlistSongRepository.findAllByOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(PlaylistSongResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlaylistSongResponse addSong(MultipartFile file, String title, String artist,
                                         Integer sortOrder, User addedBy) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Song title is required");
        }
        String url;
        try {
            url = storageService.upload(file, "playlist");
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Audio storage is not configured. Set R2 credentials on the server.", e);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Audio upload failed: " + e.getMessage(), e);
        }

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
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        if (request.getTitle() != null) song.setTitle(request.getTitle());
        if (request.getArtist() != null) song.setArtist(request.getArtist());
        if (request.getSortOrder() != null) song.setSortOrder(request.getSortOrder());

        PlaylistSong saved = playlistSongRepository.save(song);
        return PlaylistSongResponse.from(saved);
    }

    @Transactional
    public void deleteSong(Long id) {
        PlaylistSong song = playlistSongRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        playlistSongRepository.deleteById(id);

        String fileUrl = song.getFileUrl();
        if (fileUrl == null || fileUrl.isBlank() || s3Client == null) {
            return;
        }

        String key = extractKey(fileUrl);
        if (key == null) {
            log.warn("Could not extract R2 key from URL, skipping delete: {}", fileUrl);
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
            log.info("Deleted playlist file from R2: {}", key);
        } catch (Exception e) {
            log.warn("Failed to delete R2 object for song {}: {}", id, e.getMessage());
        }
    }

    private String extractKey(String fileUrl) {
        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath();
            if (path == null || path.isBlank() || "/".equals(path)) {
                return null;
            }
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (Exception e) {
            return null;
        }
    }
}

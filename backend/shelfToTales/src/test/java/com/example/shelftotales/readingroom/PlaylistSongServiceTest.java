package com.example.shelftotales.readingroom;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.readingroom.application.PlaylistSongRequest;
import com.example.shelftotales.readingroom.application.PlaylistSongResponse;
import com.example.shelftotales.readingroom.application.PlaylistSongService;
import com.example.shelftotales.readingroom.domain.PlaylistSong;
import com.example.shelftotales.readingroom.infrastructure.PlaylistSongRepository;
import com.example.shelftotales.shared.config.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaylistSongServiceTest {

    @Mock
    private PlaylistSongRepository playlistSongRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private PlaylistSongService playlistSongService;

    private User currentUser;
    private PlaylistSong song;
    private MockMultipartFile audioFile;

    @BeforeEach
    void setUp() {
        currentUser = User.builder()
                .id(1L)
                .email("current@example.com")
                .fullName("Current User")
                .role(com.example.shelftotales.auth.domain.Role.USER)
                .following(new java.util.HashSet<>())
                .followers(new java.util.HashSet<>())
                .build();

        song = PlaylistSong.builder()
                .id(10L)
                .title("Test Song")
                .artist("Test Artist")
                .fileUrl("playlist/test-file.mp3")
                .sortOrder(1)
                .addedBy(currentUser)
                .build();

        audioFile = new MockMultipartFile(
                "file",
                "test-song.mp3",
                "audio/mpeg",
                "fake audio content".getBytes()
        );
    }

    @Test
    void getAllSongs_returnsListOfSongs() {
        when(playlistSongRepository.findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(song));

        List<PlaylistSongResponse> songs = playlistSongService.getAllSongs();

        assertNotNull(songs);
        assertEquals(1, songs.size());
        assertEquals("Test Song", songs.get(0).getTitle());
        assertEquals("Test Artist", songs.get(0).getArtist());
        verify(playlistSongRepository).findAllByOrderBySortOrderAscCreatedAtAsc();
    }

    @Test
    void addSong_uploadsFileAndReturnsResponse() {
        when(storageService.upload(any(), anyString())).thenReturn("playlist/test-file.mp3");
        when(playlistSongRepository.save(any(PlaylistSong.class))).thenAnswer(invocation -> {
            PlaylistSong s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        PlaylistSongResponse response = playlistSongService.addSong(
                audioFile, "Test Song", "Test Artist", 1, currentUser);

        assertNotNull(response);
        assertEquals("Test Song", response.getTitle());
        assertEquals("Test Artist", response.getArtist());
        assertEquals("playlist/test-file.mp3", response.getFileUrl());
        verify(storageService).upload(audioFile, "playlist");
        verify(playlistSongRepository).save(any(PlaylistSong.class));
    }

    @Test
    void addSong_throwsIllegalArgumentExceptionForEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "test.mp3", "audio/mpeg", new byte[0]);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> playlistSongService.addSong(emptyFile, "Test Song", "Test Artist", 1, currentUser));

        assertEquals("Audio file is required", ex.getMessage());
        verifyNoInteractions(playlistSongRepository);
        verifyNoInteractions(storageService);
    }

    @Test
    void addSong_throwsIllegalArgumentExceptionForBlankTitle() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> playlistSongService.addSong(audioFile, "   ", "Test Artist", 1, currentUser));

        assertEquals("Song title is required", ex.getMessage());
        verifyNoInteractions(playlistSongRepository);
        verifyNoInteractions(storageService);
    }

    @Test
    void updateSong_updatesFieldsOnExistingSong() {
        when(playlistSongRepository.findById(10L)).thenReturn(Optional.of(song));
        when(playlistSongRepository.save(any(PlaylistSong.class))).thenAnswer(inv -> inv.getArgument(0));

        PlaylistSongRequest request = new PlaylistSongRequest();
        request.setTitle("Updated Title");
        request.setArtist("Updated Artist");
        request.setSortOrder(5);

        PlaylistSongResponse response = playlistSongService.updateSong(10L, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Artist", response.getArtist());
        assertEquals(5, response.getSortOrder());
        verify(playlistSongRepository).findById(10L);
        verify(playlistSongRepository).save(any(PlaylistSong.class));
    }

    @Test
    void updateSong_throwsIllegalArgumentExceptionWhenNotFound() {
        when(playlistSongRepository.findById(99L)).thenReturn(Optional.empty());

        PlaylistSongRequest request = new PlaylistSongRequest();
        request.setTitle("Updated Title");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> playlistSongService.updateSong(99L, request));

        assertEquals("Song not found: 99", ex.getMessage());
        verify(playlistSongRepository).findById(99L);
        verify(playlistSongRepository, never()).save(any());
    }

    @Test
    void deleteSong_deletesExistingSong() {
        when(playlistSongRepository.existsById(10L)).thenReturn(true);
        doNothing().when(playlistSongRepository).deleteById(10L);

        playlistSongService.deleteSong(10L);

        verify(playlistSongRepository).existsById(10L);
        verify(playlistSongRepository).deleteById(10L);
    }

    @Test
    void deleteSong_throwsIllegalArgumentExceptionWhenNotFound() {
        when(playlistSongRepository.existsById(99L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> playlistSongService.deleteSong(99L));

        assertEquals("Song not found: 99", ex.getMessage());
        verify(playlistSongRepository).existsById(99L);
        verify(playlistSongRepository, never()).deleteById(any());
    }
}

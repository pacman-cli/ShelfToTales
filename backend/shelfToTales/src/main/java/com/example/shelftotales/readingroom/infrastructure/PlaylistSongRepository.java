package com.example.shelftotales.readingroom.infrastructure;

import com.example.shelftotales.readingroom.domain.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findAllByOrderBySortOrderAscCreatedAtAsc();
}

package com.example.shelftotales.readingroom.infrastructure;

import com.example.shelftotales.readingroom.domain.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findAllByOrderBySortOrderAscCreatedAtAsc();
}

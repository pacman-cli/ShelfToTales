package com.example.shelftotales.readingroom.infrastructure;

import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.bookshelf.domain.*;

import com.example.shelftotales.readingroom.domain.ReadingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ReadingRoomRepository extends JpaRepository<ReadingRoom, Long> {
    List<ReadingRoom> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r, COUNT(m), COALESCE(SUM(CASE WHEN m.user.id = :userId THEN 1 ELSE 0 END), 0) " +
           "FROM ReadingRoom r LEFT JOIN r.members m " +
           "WHERE r.visibility = 'PUBLIC' OR EXISTS (SELECT 1 FROM RoomMember rm WHERE rm.room = r AND rm.user.id = :userId) " +
           "GROUP BY r " +
           "ORDER BY r.createdAt DESC")
    List<Object[]> findVisibleRoomsWithStats(@Param("userId") Long userId);
}

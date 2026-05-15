package com.example.shelftotales.repository;

import com.example.shelftotales.model.Bookshelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
    List<Bookshelf> findByUserIdOrderByPositionAsc(Long userId);
    Optional<Bookshelf> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(MAX(b.position), -1) + 1 FROM Bookshelf b WHERE b.user.id = :userId")
    int nextPosition(@Param("userId") Long userId);
}

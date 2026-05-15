package com.example.shelftotales.repository;

import com.example.shelftotales.model.Bookshelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
    List<Bookshelf> findByUserIdOrderByPositionAsc(Long userId);
    Optional<Bookshelf> findByIdAndUserId(Long id, Long userId);
    int countByUserId(Long userId);
}

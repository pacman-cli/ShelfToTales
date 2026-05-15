package com.example.shelftotales.repository;

import com.example.shelftotales.model.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelfBookRepository extends JpaRepository<ShelfBook, Long> {
    List<ShelfBook> findByBookshelfIdOrderByAddedAtAsc(Long shelfId);
    Optional<ShelfBook> findByBookshelfIdAndBookId(Long shelfId, Long bookId);
    boolean existsByBookshelfIdAndBookId(Long shelfId, Long bookId);
    int countByBookshelfId(Long shelfId);
    void deleteByBookshelfIdAndBookId(Long shelfId, Long bookId);
}

package com.example.shelftotales.ai.infrastructure;

import com.example.shelftotales.ai.domain.BookSpoilerModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookSpoilerModelRepository extends JpaRepository<BookSpoilerModel, Long> {

    Optional<BookSpoilerModel> findByBookId(Long bookId);

    Optional<BookSpoilerModel> findByBookIdAndStatus(Long bookId, BookSpoilerModel.ModelStatus status);

    List<BookSpoilerModel> findByStatus(BookSpoilerModel.ModelStatus status);

    @Query("SELECT m FROM BookSpoilerModel m WHERE m.status = 'READY_TO_TRAIN' OR m.status = 'COLLECTING_DATA'")
    List<BookSpoilerModel> findBooksNeedingTraining();

    @Query("SELECT m FROM BookSpoilerModel m WHERE m.bookId IN :bookIds AND m.status = 'ACTIVE'")
    List<BookSpoilerModel> findActiveModelsByBookIds(List<Long> bookIds);

    boolean existsByBookIdAndStatus(Long bookId, BookSpoilerModel.ModelStatus status);
}

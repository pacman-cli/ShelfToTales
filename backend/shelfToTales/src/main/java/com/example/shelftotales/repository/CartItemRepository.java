package com.example.shelftotales.repository;

import com.example.shelftotales.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT c FROM CartItem c JOIN FETCH c.book WHERE c.user.id = :userId ORDER BY c.createdAt ASC")
    List<CartItem> findByUserIdWithBook(@Param("userId") Long userId);

    Optional<CartItem> findByUserIdAndBookId(Long userId, Long bookId);
    void deleteByUserIdAndBookId(Long userId, Long bookId);
    int countByUserId(Long userId);
    void deleteAllByUserId(Long userId);
}

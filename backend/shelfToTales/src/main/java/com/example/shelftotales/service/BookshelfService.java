package com.example.shelftotales.service;

import com.example.shelftotales.dto.*;
import com.example.shelftotales.model.*;
import com.example.shelftotales.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookshelfService {
    private final BookshelfRepository bookshelfRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + auth.getName()));
    }

    public List<BookshelfResponse> getUserBookshelves() {
        User user = getAuthenticatedUser();
        return bookshelfRepository.findByUserIdOrderByPositionAsc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookshelfResponse createBookshelf(BookshelfRequest request) {
        User user = getAuthenticatedUser();
        int position = bookshelfRepository.nextPosition(user.getId());
        Bookshelf shelf = Bookshelf.builder().name(request.getName()).position(position).user(user).build();
        return toResponse(bookshelfRepository.save(shelf));
    }

    @Transactional
    public BookshelfResponse updateBookshelf(Long id, BookshelfRequest request) {
        User user = getAuthenticatedUser();
        Bookshelf shelf = bookshelfRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + id));
        shelf.setName(request.getName());
        return toResponse(bookshelfRepository.save(shelf));
    }

    @Transactional
    public void deleteBookshelf(Long id) {
        User user = getAuthenticatedUser();
        Bookshelf shelf = bookshelfRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + id));
        bookshelfRepository.delete(shelf);
    }

    @Transactional
    public void reorder(List<Long> shelfIds) {
        User user = getAuthenticatedUser();
        List<Bookshelf> shelves = bookshelfRepository.findByUserIdOrderByPositionAsc(user.getId());
        for (int i = 0; i < shelfIds.size() && i < shelves.size(); i++) {
            int pos = i;
            shelves.stream().filter(s -> s.getId().equals(shelfIds.get(pos))).findFirst()
                    .ifPresent(s -> s.setPosition(pos));
        }
        bookshelfRepository.saveAll(shelves);
    }

    private BookshelfResponse toResponse(Bookshelf shelf) {
        return BookshelfResponse.builder()
                .id(shelf.getId()).name(shelf.getName()).position(shelf.getPosition())
                .bookCount(0).createdAt(shelf.getCreatedAt()).updatedAt(shelf.getUpdatedAt()).build();
    }
}

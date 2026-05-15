package com.example.shelftotales.service;

import com.example.shelftotales.dto.*;
import com.example.shelftotales.model.Bookshelf;
import com.example.shelftotales.model.User;
import com.example.shelftotales.repository.BookshelfRepository;
import com.example.shelftotales.repository.ShelfBookRepository;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookshelfService {
    private final BookshelfRepository bookshelfRepository;
    private final ShelfBookRepository shelfBookRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BookshelfResponse> getUserBookshelves() {
        User user = AuthUtils.getCurrentUser(userRepository);
        return bookshelfRepository.findByUserIdOrderByPositionAsc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookshelfResponse createBookshelf(BookshelfRequest request) {
        User user = AuthUtils.getCurrentUser(userRepository);
        int position = bookshelfRepository.nextPosition(user.getId());
        Bookshelf shelf = Bookshelf.builder()
                .name(request.getName())
                .position(position)
                .theme(request.getTheme() != null ? request.getTheme() : "glass")
                .user(user).build();
        return toResponse(bookshelfRepository.save(shelf));
    }

    @Transactional
    public BookshelfResponse updateBookshelf(Long id, BookshelfRequest request) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Bookshelf shelf = bookshelfRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + id));
        if (request.getName() != null) shelf.setName(request.getName());
        if (request.getTheme() != null) shelf.setTheme(request.getTheme());
        return toResponse(bookshelfRepository.save(shelf));
    }

    @Transactional
    public void deleteBookshelf(Long id) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Bookshelf shelf = bookshelfRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + id));
        bookshelfRepository.delete(shelf);
    }

    @Transactional
    public void reorder(List<Long> shelfIds) {
        User user = AuthUtils.getCurrentUser(userRepository);
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
                .theme(shelf.getTheme())
                .bookCount(shelfBookRepository.countByBookshelfId(shelf.getId()))
                .createdAt(shelf.getCreatedAt()).updatedAt(shelf.getUpdatedAt()).build();
    }
}

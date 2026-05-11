package com.example.shelftotales.service;

import com.example.shelftotales.model.Book;
import com.example.shelftotales.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.isBlank()) {
            return getAllBooks();
        }
        return bookRepository.searchBooks(query);
    }

    public List<Book> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }
}

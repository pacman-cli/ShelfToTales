package com.example.shelftotales.controller;

import com.example.shelftotales.model.Book;
import com.example.shelftotales.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping
    public List<Book> getBooks(@RequestParam(required = false) String q,
                               @RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return bookService.getBooksByCategory(categoryId);
        }
        if (q != null) {
            return bookService.searchBooks(q);
        }
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

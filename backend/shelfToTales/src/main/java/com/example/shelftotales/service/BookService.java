package com.example.shelftotales.service;

import com.example.shelftotales.dto.BookRequest;
import com.example.shelftotales.dto.BookResponse;
import com.example.shelftotales.dto.PagedResponse;
import com.example.shelftotales.dto.ReadBookResponse;
import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.Category;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public PagedResponse<BookResponse> getBooks(String query, Long categoryId, int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> bookPage = bookRepository.searchBooks(query, categoryId, pageable);

        return PagedResponse.<BookResponse>builder()
                .content(bookPage.map(this::toResponse).getContent())
                .page(bookPage.getNumber())
                .size(bookPage.getSize())
                .totalElements(bookPage.getTotalElements())
                .totalPages(bookPage.getTotalPages())
                .last(bookPage.isLast())
                .first(bookPage.isFirst())
                .empty(bookPage.isEmpty())
                .build();
    }

    public Optional<BookResponse> getBookById(Long id) {
        return bookRepository.findById(id).map(this::toResponse);
    }

    public Optional<ReadBookResponse> getReadBookInfo(Long id) {
        return bookRepository.findByIdAndPdfUrlIsNotNull(id).map(book -> ReadBookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .pdfUrl(book.getPdfUrl())
                .previewAvailable(book.isPreviewAvailable())
                .coverUrl(book.getCoverUrl())
                .build());
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .coverUrl(request.getCoverUrl())
                .publishedDate(request.getPublishedDate())
                .category(category)
                .build();
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setDescription(request.getDescription());
        book.setCoverUrl(request.getCoverUrl());
        book.setPublishedDate(request.getPublishedDate());
        book.setCategory(category);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new IllegalArgumentException("Book not found: " + id);
        }
        bookRepository.deleteById(id);
    }

    private BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .description(book.getDescription())
                .coverUrl(book.getCoverUrl())
                .publishedDate(book.getPublishedDate())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .pdfUrl(book.getPdfUrl())
                .previewAvailable(book.isPreviewAvailable())
                .build();
    }
}

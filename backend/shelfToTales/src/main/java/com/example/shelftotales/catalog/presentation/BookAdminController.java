package com.example.shelftotales.catalog.presentation;

import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.bookshelf.domain.*;

import com.example.shelftotales.catalog.application.BookAdminService;
import com.example.shelftotales.catalog.application.BookRequest;
import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.catalog.application.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/books")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Books", description = "Admin-only book CRUD operations")
public class BookAdminController {

    private final BookService bookService;
    private final BookAdminService bookAdminService;

    @PostMapping
    @Operation(summary = "Create a new book")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(request));
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload a book with PDF file to R2 storage")
    public ResponseEntity<BookResponse> uploadBook(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "isbn", required = false) String isbn,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "coverUrl", required = false) String coverUrl,
            @RequestParam(value = "publishedDate", required = false) String publishedDate,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "previewAvailable", required = false) Boolean previewAvailable,
            @RequestParam(value = "price", required = false) java.math.BigDecimal price,
            @RequestParam(value = "stock", required = false) Integer stock,
            @RequestParam(value = "moodTags", required = false) String moodTags) throws java.io.IOException {

        BookRequest request = BookRequest.builder()
                .title(title)
                .author(author)
                .isbn(isbn)
                .description(description)
                .coverUrl(coverUrl)
                .publishedDate(publishedDate != null ? java.time.LocalDate.parse(publishedDate) : null)
                .categoryId(categoryId)
                .previewAvailable(previewAvailable)
                .price(price)
                .stock(stock)
                .moodTags(moodTags)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(bookAdminService.uploadBook(file, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing book")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a book")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}

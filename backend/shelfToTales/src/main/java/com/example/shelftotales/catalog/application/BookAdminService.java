package com.example.shelftotales.catalog.application;

import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.domain.Category;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.catalog.infrastructure.CategoryRepository;
import com.example.shelftotales.event.BookUploadedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookAdminService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${storage.r2.bucket:shelftotales}")
    private String bucket;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private S3Client s3Client;

    @Transactional
    public BookResponse uploadBook(MultipartFile file, BookRequest request) throws IOException {
        String r2ObjectKey = uploadToR2(file);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .coverUrl(request.getCoverUrl())
                .publishedDate(request.getPublishedDate())
                .pdfUrl(r2ObjectKey)
                .previewAvailable(request.getPreviewAvailable() != null ? request.getPreviewAvailable() : false)
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .category(category)
                .moodTags(request.getMoodTags())
                .build();

        Book savedBook = bookRepository.save(book);

        eventPublisher.publishEvent(new BookUploadedEvent(savedBook.getId(), r2ObjectKey));

        log.info("Book uploaded: id={}, r2Key={}", savedBook.getId(), r2ObjectKey);

        return toResponse(savedBook);
    }

    private String uploadToR2(MultipartFile file) throws IOException {
        if (s3Client == null) {
            throw new IllegalStateException("Storage not configured. Set R2 credentials on the server.");
        }
        String ext = getExtension(file.getOriginalFilename());
        String key = "pdfs/" + UUID.randomUUID() + ext;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes()));

        log.info("Uploaded file to R2: bucket={}, key={}", bucket, key);
        return key;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
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
                .price(book.getPrice())
                .stock(book.getStock())
                .moodTags(book.getMoodTags())
                .build();
    }
}

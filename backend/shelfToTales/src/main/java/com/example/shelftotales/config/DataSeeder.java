package com.example.shelftotales.config;

import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.Category;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            Category fiction = Category.builder().name("Fiction").description("Imaginary stories").build();
            Category fantasy = Category.builder().name("Fantasy").description("Magical worlds").build();
            Category science = Category.builder().name("Science").description("Non-fiction science").build();

            categoryRepository.saveAll(List.of(fiction, fantasy, science));

            Book book1 = Book.builder()
                    .title("The Great Gatsby")
                    .author("F. Scott Fitzgerald")
                    .isbn("9780743273565")
                    .description("A story of wealth and love in the 1920s.")
                    .coverUrl("https://covers.openlibrary.org/b/id/7222246-L.jpg")
                    .publishedDate(LocalDate.of(1925, 4, 10))
                    .category(fiction)
                    .build();

            Book book2 = Book.builder()
                    .title("The Hobbit")
                    .author("J.R.R. Tolkien")
                    .isbn("9780547928227")
                    .description("A hobbit's journey to reclaim a treasure.")
                    .coverUrl("https://covers.openlibrary.org/b/id/6979861-L.jpg")
                    .publishedDate(LocalDate.of(1937, 9, 21))
                    .category(fantasy)
                    .build();

            Book book3 = Book.builder()
                    .title("A Brief History of Time")
                    .author("Stephen Hawking")
                    .isbn("9780553380163")
                    .description("Explaining cosmology to the general public.")
                    .coverUrl("https://covers.openlibrary.org/b/id/6520353-L.jpg")
                    .publishedDate(LocalDate.of(1988, 4, 1))
                    .category(science)
                    .build();

            bookRepository.saveAll(List.of(book1, book2, book3));
        }
    }
}

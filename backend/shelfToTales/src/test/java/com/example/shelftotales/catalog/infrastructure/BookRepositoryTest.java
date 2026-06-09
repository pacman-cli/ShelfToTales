package com.example.shelftotales.catalog.infrastructure;

import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.domain.Category;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void searchBooks_matchesIsbn() {
        Category category = categoryRepository.save(Category.builder()
                .name("Fiction")
                .description("Stories")
                .build());

        bookRepository.save(Book.builder()
                .title("Test Book")
                .author("Test Author")
                .isbn("9780306406157")
                .description("A test book")
                .coverUrl("https://example.com/cover.jpg")
                .publishedDate(LocalDate.of(2024, 1, 1))
                .price(BigDecimal.valueOf(12.50))
                .stock(3)
                .category(category)
                .build());

        Page<Book> byIsbn = bookRepository.searchBooks("9780306406157", null, null, null, false, PageRequest.of(0, 10));

        assertEquals(1, byIsbn.getTotalElements());
        assertEquals("9780306406157", byIsbn.getContent().get(0).getIsbn());
    }

    @Test
    void searchBooks_filtersPriceAndStockServerSide() {
        Category category = categoryRepository.save(Category.builder()
                .name("Science")
                .description("Science books")
                .build());

        bookRepository.save(Book.builder()
                .title("In Stock Midrange")
                .author("Author One")
                .isbn("1111111111")
                .description("Matches price and stock")
                .coverUrl("https://example.com/1.jpg")
                .publishedDate(LocalDate.of(2024, 1, 1))
                .price(BigDecimal.valueOf(15.00))
                .stock(5)
                .category(category)
                .build());

        bookRepository.save(Book.builder()
                .title("Out of Stock")
                .author("Author Two")
                .isbn("2222222222")
                .description("Same price but unavailable")
                .coverUrl("https://example.com/2.jpg")
                .publishedDate(LocalDate.of(2024, 1, 1))
                .price(BigDecimal.valueOf(16.00))
                .stock(0)
                .category(category)
                .build());

        bookRepository.save(Book.builder()
                .title("Too Expensive")
                .author("Author Three")
                .isbn("3333333333")
                .description("Outside the price range")
                .coverUrl("https://example.com/3.jpg")
                .publishedDate(LocalDate.of(2024, 1, 1))
                .price(BigDecimal.valueOf(30.00))
                .stock(4)
                .category(category)
                .build());

        Page<Book> filtered = bookRepository.searchBooks(
                null,
                null,
                BigDecimal.valueOf(10.00),
                BigDecimal.valueOf(20.00),
                true,
                PageRequest.of(0, 10)
        );

        assertEquals(1, filtered.getTotalElements());
        assertEquals("In Stock Midrange", filtered.getContent().get(0).getTitle());
    }
}

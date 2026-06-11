package com.example.shelftotales.service;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.bookshelf.application.*;
import com.example.shelftotales.bookshelf.domain.ReadingActivity;
import com.example.shelftotales.bookshelf.domain.ReadingStatus;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.commerce.domain.CartItem;
import com.example.shelftotales.wishlist.domain.WishlistItem;
import com.example.shelftotales.shared.util.AuthUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ReadingStatsService readingStatsService;
    @Mock private CommerceStatsService commerceStatsService;
    @Mock private DashboardRecommendationService dashboardRecommendationService;

    private DashboardService dashboardService;
    private User testUser;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
            userRepository, readingStatsService, commerceStatsService, dashboardRecommendationService
        );
        testUser = User.builder()
            .id(1L)
            .fullName("Test User")
            .email("test@example.com")
            .profileImageUrl("https://example.com/avatar.png")
            .createdAt(LocalDateTime.now().minusDays(30))
            .build();
    }

    @Test
    void getDashboard_shouldAggregateAllData() {
        try (var mockedAuth = mockStatic(AuthUtils.class)) {
            mockedAuth.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);

            ReadingActivity activity = ReadingActivity.builder()
                .id(1L).user(testUser).book(Book.builder().id(1L).title("Test Book").build())
                .status(ReadingStatus.IN_PROGRESS).currentPage(50).totalPagesRead(50)
                .startedAt(LocalDateTime.now()).lastReadAt(LocalDateTime.now())
                .build();

            when(readingStatsService.getActiveReadings(1L)).thenReturn(List.of(activity));
            when(readingStatsService.getTotalBookshelves(1L)).thenReturn(0);
            when(readingStatsService.getCompletedCount(1L)).thenReturn(5);
            when(readingStatsService.getPagesRead(1L)).thenReturn(1000);
            when(readingStatsService.getBooksOwned(1L)).thenReturn(10);
            when(readingStatsService.getCategoriesOwned(1L)).thenReturn(3);

            when(commerceStatsService.getCartItems(1L)).thenReturn(List.of());
            when(commerceStatsService.getWishlistItems(1L)).thenReturn(List.of());
            when(commerceStatsService.getOrderCount(1L)).thenReturn(12);
            when(commerceStatsService.getTotalSpent(1L)).thenReturn(BigDecimal.valueOf(459.75));
            when(commerceStatsService.getCartTotalValue(anyList())).thenReturn(BigDecimal.ZERO);

            when(readingStatsService.buildCategoryBreakdown(1L)).thenReturn(List.of());
            when(readingStatsService.buildCurrentlyReading(anyList())).thenReturn(List.of());
            when(dashboardRecommendationService.getDashboardRecommendations(1L)).thenReturn(List.of());

            DashboardResponse response = dashboardService.getDashboard();

            assertNotNull(response);
            assertEquals("Test User", response.getFullName());
            assertEquals(1, response.getTotalBooksReading());
            assertEquals(5, response.getTotalBooksCompleted());
            assertEquals(1000, response.getTotalPagesRead());
            assertEquals(10, response.getTotalBooksOwned());
            assertEquals(0, response.getCartItemCount());
            assertEquals(0, response.getWishlistCount());
            assertEquals(12, response.getTotalOrders());
            assertEquals(BigDecimal.valueOf(459.75), response.getTotalSpent());
        }
    }
}

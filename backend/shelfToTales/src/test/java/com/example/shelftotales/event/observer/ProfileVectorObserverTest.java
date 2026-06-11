package com.example.shelftotales.event.observer;

import com.example.shelftotales.event.BookCompletedEvent;
import com.example.shelftotales.event.OrderConfirmedEvent;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.catalog.domain.BookEmbedding;
import com.example.shelftotales.catalog.infrastructure.BookEmbeddingRepository;
import com.example.shelftotales.bookshelf.infrastructure.ShelfBookRepository;
import com.example.shelftotales.commerce.infrastructure.OrderRepository;
import com.example.shelftotales.ai.application.AIService;
import com.example.shelftotales.ai.infrastructure.UserProfileVectorRepository;
import com.example.shelftotales.ai.domain.UserProfileVector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.lang.reflect.Method;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProfileVectorObserverTest {

    @Mock
    private UserProfileVectorRepository profileVectorRepository;

    @Mock
    private BookEmbeddingRepository bookEmbeddingRepository;

    @Mock
    private ShelfBookRepository shelfBookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AIService aiService;

    @InjectMocks
    private ProfileVectorObserver profileVectorObserver;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testMethodsAreAnnotatedWithAsync() throws NoSuchMethodException {
        Method onBookCompletedMethod = ProfileVectorObserver.class.getMethod("onBookCompleted", BookCompletedEvent.class);
        Method onOrderConfirmedMethod = ProfileVectorObserver.class.getMethod("onOrderConfirmed", OrderConfirmedEvent.class);

        assertTrue(onBookCompletedMethod.isAnnotationPresent(org.springframework.scheduling.annotation.Async.class));
        assertTrue(onOrderConfirmedMethod.isAnnotationPresent(org.springframework.scheduling.annotation.Async.class));
    }

    @Test
    public void testRecalculateUserVectorOnBookCompleted() {
        Long userId = 1L;
        BookCompletedEvent event = new BookCompletedEvent(userId, 100L, "Book Title", "http://cover.url", 5L);

        when(shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "COMPLETED")).thenReturn(List.of(10L));
        when(shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "READING")).thenReturn(List.of(20L));
        when(orderRepository.findBoughtBookIdsByUserId(userId)).thenReturn(List.of(30L));

        BookEmbedding emb1 = BookEmbedding.builder().bookId(10L).vectorData("1,0").build();
        BookEmbedding emb2 = BookEmbedding.builder().bookId(20L).vectorData("0,1").build();
        BookEmbedding emb3 = BookEmbedding.builder().bookId(30L).vectorData("0.5,0.5").build();

        when(bookEmbeddingRepository.findAllById(anySet())).thenReturn(List.of(emb1, emb2, emb3));

        double[] v1 = new double[384]; v1[0] = 1.0;
        double[] v2 = new double[384]; v2[1] = 1.0;
        double[] v3 = new double[384]; v3[0] = 0.5; v3[1] = 0.5;

        when(aiService.stringToVector("1,0")).thenReturn(v1);
        when(aiService.stringToVector("0,1")).thenReturn(v2);
        when(aiService.stringToVector("0.5,0.5")).thenReturn(v3);
        when(aiService.vectorToString(any(double[].class))).thenReturn("recalculated_vector_data");

        User mockUser = new User();
        mockUser.setId(userId);
        when(userRepository.getReferenceById(userId)).thenReturn(mockUser);
        when(profileVectorRepository.findById(userId)).thenReturn(Optional.empty());

        profileVectorObserver.onBookCompleted(event);

        ArgumentCaptor<UserProfileVector> captor = ArgumentCaptor.forClass(UserProfileVector.class);
        verify(profileVectorRepository).save(captor.capture());

        UserProfileVector savedProfile = captor.getValue();
        assertEquals(userId, savedProfile.getUserId());
        assertEquals("recalculated_vector_data", savedProfile.getVectorData());
    }

    @Test
    public void testRecalculateUserVectorOnOrderConfirmed() {
        Long userId = 2L;
        OrderConfirmedEvent event = new OrderConfirmedEvent(userId, 500L, List.of(30L));

        when(shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "COMPLETED")).thenReturn(Collections.emptyList());
        when(shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "READING")).thenReturn(Collections.emptyList());
        when(orderRepository.findBoughtBookIdsByUserId(userId)).thenReturn(Collections.emptyList());

        profileVectorObserver.onOrderConfirmed(event);

        verify(profileVectorRepository, never()).save(any(UserProfileVector.class));
    }
}

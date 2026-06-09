package com.example.shelftotales.service;

import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.review.application.*;
import com.example.shelftotales.review.domain.*;
import com.example.shelftotales.review.infrastructure.*;
import com.example.shelftotales.shared.exception.ResourceNotFoundException;
import com.example.shelftotales.shared.util.AuthUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewCommentServiceTest {

    @Mock private ReviewCommentRepository commentRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ReviewCommentService commentService;

    private User testUser;
    private Review testReview;
    private ReviewComment comment1;
    private ReviewComment comment2;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("user@test.com").fullName("Test User").role(Role.USER).build();
        testReview = Review.builder().id(10L).comment("Good book").build();
        
        comment1 = ReviewComment.builder()
                .id(100L).review(testReview).user(testUser).parentComment(null).content("Comment 1").createdAt(LocalDateTime.now())
                .build();
        
        comment2 = ReviewComment.builder()
                .id(101L).review(testReview).user(testUser).parentComment(comment1).content("Reply to 1").createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getCommentsTree_returnsTree() {
        when(reviewRepository.existsById(10L)).thenReturn(true);
        when(commentRepository.findByReviewIdWithUser(10L)).thenReturn(Arrays.asList(comment1, comment2));

        List<ReviewCommentResponse> tree = commentService.getCommentsTree(10L);

        assertNotNull(tree);
        assertEquals(1, tree.size());
        assertEquals(100L, tree.get(0).getId());
        assertEquals(1, tree.get(0).getReplies().size());
        assertEquals(101L, tree.get(0).getReplies().get(0).getId());
    }

    @Test
    void addComment_succeeds() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(reviewRepository.findById(10L)).thenReturn(Optional.of(testReview));
            when(commentRepository.save(any(ReviewComment.class))).thenReturn(comment1);

            ReviewCommentRequest req = new ReviewCommentRequest(null, "New comment");
            ReviewCommentResponse res = commentService.addComment(10L, req);

            assertNotNull(res);
            assertEquals(100L, res.getId());
            assertEquals("Comment 1", res.getContent());
        }
    }

    @Test
    void deleteComment_succeedsForAuthor() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(commentRepository.findById(100L)).thenReturn(Optional.of(comment1));

            assertDoesNotThrow(() -> commentService.deleteComment(100L));
            verify(commentRepository, times(1)).delete(comment1);
        }
    }

    @Test
    void deleteComment_throwsForUnauthorized() {
        User otherUser = User.builder().id(2L).role(Role.USER).build();
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(otherUser);
            when(commentRepository.findById(100L)).thenReturn(Optional.of(comment1));

            assertThrows(SecurityException.class, () -> commentService.deleteComment(100L));
            verify(commentRepository, never()).delete(any());
        }
    }
}

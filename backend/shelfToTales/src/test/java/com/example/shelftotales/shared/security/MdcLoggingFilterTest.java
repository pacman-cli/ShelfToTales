package com.example.shelftotales.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class MdcLoggingFilterTest {

    private final MdcLoggingFilter filter = new MdcLoggingFilter();

    @AfterEach
    public void tearDown() {
        MDC.clear();
    }

    @Test
    public void doFilter_WithExistingHeader_ShouldUseExistingHeader() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getHeader("X-Request-ID")).thenReturn("existing-id-123");

        filter.doFilter(request, response, (req, res) -> {
            assertEquals("existing-id-123", MDC.get("requestId"));
            verify(response).setHeader("X-Request-ID", "existing-id-123");
        });

        assertNull(MDC.get("requestId"));
    }

    @Test
    public void doFilter_WithoutHeader_ShouldGenerateUuid() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getHeader("X-Request-ID")).thenReturn(null);

        filter.doFilter(request, response, (req, res) -> {
            String requestId = MDC.get("requestId");
            assertNotNull(requestId);
            assertFalse(requestId.isBlank());
            verify(response).setHeader(eq("X-Request-ID"), eq(requestId));
        });

        assertNull(MDC.get("requestId"));
    }
}

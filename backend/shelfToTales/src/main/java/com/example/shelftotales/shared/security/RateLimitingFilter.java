package com.example.shelftotales.shared.security;

import com.example.shelftotales.admin.application.SecurityMonitoringService;
import com.example.shelftotales.admin.domain.SecurityEventSeverity;
import com.example.shelftotales.admin.domain.SecurityEventType;
import com.example.shelftotales.shared.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int CAPACITY = 10;
    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final Duration EVICTION_TTL = Duration.ofMinutes(2);
    private static final int MAX_BUCKETS = 10_000;

    private record BucketEntry(Bucket bucket, Instant lastAccess) {}

    private final Map<String, BucketEntry> buckets = new ConcurrentHashMap<>();
    private final Map<RouteCategory, Bandwidth> bandwidths;
    private final ObjectMapper objectMapper;
    private final SecurityMonitoringService securityMonitoringService;

    public RateLimitingFilter(
            Map<RouteCategory, Bandwidth> rateLimitBandwidths,
            ObjectMapper objectMapper,
            SecurityMonitoringService securityMonitoringService) {
        this.bandwidths = rateLimitBandwidths;
        this.objectMapper = objectMapper;
        this.securityMonitoringService = securityMonitoringService;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Apply filter to ALL /api/* paths. Per-category limits apply in doFilterInternal.
        String uri = request.getRequestURI();
        return uri == null || !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        evictStaleEntries();

        String key = clientKey(request);
        Bandwidth bw = bandwidths.getOrDefault(RouteCategory.fromUri(request.getRequestURI()),
                defaultBandwidth());
        BucketEntry entry = buckets.compute(key, (k, existing) -> {
            if (existing == null) {
                return new BucketEntry(Bucket.builder().addLimit(bw).build(), Instant.now());
            }
            return new BucketEntry(existing.bucket(), Instant.now());
        });

        if (entry.bucket().tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        recordRateLimitEvent(request);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(WINDOW.toSeconds()));

        ErrorResponse err = new ErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too Many Requests",
                "Rate limit exceeded. Try again in " + WINDOW.toSeconds() + " seconds."
        );
        response.getWriter().write(objectMapper.writeValueAsString(err));
    }

    private void recordRateLimitEvent(HttpServletRequest request) {
        try {
            securityMonitoringService.record(
                    SecurityEventType.RATE_LIMIT_EXCEEDED,
                    SecurityEventSeverity.HIGH,
                    request,
                    null,
                    "Rate limit exceeded for " + clientKey(request)
            );
        } catch (RuntimeException ignored) {
            // Monitoring must never block request handling.
        }
    }

    private void evictStaleEntries() {
        if (buckets.size() <= MAX_BUCKETS / 2) return;
        Instant cutoff = Instant.now().minus(EVICTION_TTL);
        buckets.entrySet().removeIf(e -> e.getValue().lastAccess().isBefore(cutoff));
    }

    private static String clientKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        RouteCategory cat = RouteCategory.fromUri(request.getRequestURI());
        return ip + ":" + cat.name();
    }

    private static Bandwidth defaultBandwidth() {
        return Bandwidth.builder().capacity(CAPACITY).refillIntervally(CAPACITY, WINDOW).build();
    }
}

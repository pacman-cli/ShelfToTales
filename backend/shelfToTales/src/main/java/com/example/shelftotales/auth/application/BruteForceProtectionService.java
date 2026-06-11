package com.example.shelftotales.auth.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class BruteForceProtectionService {

    private static final String ATTEMPTS_PREFIX = "login:attempts:";
    private static final String LOCKOUT_PREFIX = "login:lockout:";
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;
    private static final long ATTEMPTS_TTL_MINUTES = 60;

    private final RedisTemplate<String, Object> redisTemplate;

    public void registerFailedAttempt(String email) {
        try {
            String attemptsKey = ATTEMPTS_PREFIX + email.toLowerCase();
            
            Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
            if (attempts != null && attempts == 1) {
                redisTemplate.expire(attemptsKey, ATTEMPTS_TTL_MINUTES, TimeUnit.MINUTES);
            }

            if (attempts != null && attempts >= MAX_ATTEMPTS) {
                String lockoutKey = LOCKOUT_PREFIX + email.toLowerCase();
                redisTemplate.opsForValue().set(lockoutKey, "true", LOCKOUT_DURATION_MINUTES, TimeUnit.MINUTES);
                log.warn("Account locked due to brute force protection: email={}", maskEmail(email));
            }
        } catch (Exception e) {
            log.error("Redis connection error in brute force protection increment", e);
        }
    }

    public void resetAttempts(String email) {
        try {
            String emailLower = email.toLowerCase();
            redisTemplate.delete(ATTEMPTS_PREFIX + emailLower);
            redisTemplate.delete(LOCKOUT_PREFIX + emailLower);
        } catch (Exception e) {
            log.error("Redis connection error in brute force protection reset", e);
        }
    }

    public boolean isLocked(String email) {
        try {
            String lockoutKey = LOCKOUT_PREFIX + email.toLowerCase();
            return Boolean.TRUE.equals(redisTemplate.hasKey(lockoutKey));
        } catch (Exception e) {
            log.error("Redis connection error in brute force protection check", e);
            return false;
        }
    }

    public long getLockoutRemainingSeconds(String email) {
        try {
            String lockoutKey = LOCKOUT_PREFIX + email.toLowerCase();
            Long expire = redisTemplate.getExpire(lockoutKey, TimeUnit.SECONDS);
            return expire != null && expire > 0 ? expire : 0;
        } catch (Exception e) {
            log.error("Redis connection error in brute force protection remaining time check", e);
            return 0;
        }
    }

    private static String maskEmail(String email) {
        if (email == null) return "null";
        int at = email.indexOf('@');
        if (at <= 1) return "***@" + (at >= 0 ? email.substring(at + 1) : "***");
        return email.charAt(0) + "***" + email.substring(at);
    }
}

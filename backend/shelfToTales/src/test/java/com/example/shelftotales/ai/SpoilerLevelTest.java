package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SpoilerLevelTest {

    @Test
    void safe() {
        assertEquals(SpoilerLevel.SAFE, SpoilerLevel.fromScore(0.0));
        assertEquals(SpoilerLevel.SAFE, SpoilerLevel.fromScore(0.29));
    }

    @Test
    void minor() {
        assertEquals(SpoilerLevel.MINOR_SPOILER, SpoilerLevel.fromScore(0.30));
        assertEquals(SpoilerLevel.MINOR_SPOILER, SpoilerLevel.fromScore(0.69));
    }

    @Test
    void major() {
        assertEquals(SpoilerLevel.MAJOR_SPOILER, SpoilerLevel.fromScore(0.70));
        assertEquals(SpoilerLevel.MAJOR_SPOILER, SpoilerLevel.fromScore(1.0));
    }
}

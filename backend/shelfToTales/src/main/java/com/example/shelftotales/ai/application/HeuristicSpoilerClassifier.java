package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.domain.SpoilerSentence;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Sentence-level spoiler classifier based on weighted keyword and regex patterns.
 *
 * The detector scans each sentence independently, accumulating a score in [0, 1].
 * A sentence is reported as a tagged spoiler when its score crosses the
 * MINOR threshold (0.30); the review-level score is the max sentence score.
 * The sanitized review redacts any sentence whose level is MAJOR.
 */
@Component
public class HeuristicSpoilerClassifier implements SpoilerClassifier {

    private static final String MODEL_ID = "heuristic-v1";

    private static final double MINOR_THRESHOLD = 0.30;
    private static final double MAJOR_THRESHOLD = 0.70;

    /** Map of regex → weight. Higher weight → more likely MAJOR_SPOILER. */
    private static final Map<Pattern, Double> PATTERNS = new java.util.LinkedHashMap<>();
    static {
        // Plot-level reveals
        PATTERNS.put(Pattern.compile("(?i)\\b(the )?(killer|murderer|villain|antagonist) is\\b"), 0.95);
        PATTERNS.put(Pattern.compile("(?i)\\bturns out\\b"), 0.85);
        PATTERNS.put(Pattern.compile("(?i)\\b(plot )?twist\\b"), 0.85);
        PATTERNS.put(Pattern.compile("(?i)\\b(reveal|revealed|reveals) (that|to)\\b"), 0.80);
        PATTERNS.put(Pattern.compile("(?i)\\b(the )?ending (is|was)\\b"), 0.70);
        // Death events
        PATTERNS.put(Pattern.compile("(?i)\\b\\w+ (dies|is killed|gets killed|is murdered)\\b"), 0.90);
        PATTERNS.put(Pattern.compile("(?i)\\b(dies|dying|death|dead)\\b"), 0.55);
        PATTERNS.put(Pattern.compile("(?i)\\b(kills|killed|murdered|murders)\\b"), 0.75);
        PATTERNS.put(Pattern.compile("(?i)\\b(betrays|betrayal|betrayed)\\b"), 0.65);
        // Meta spoilage
        PATTERNS.put(Pattern.compile("(?i)\\b(spoiler( alert)?)\\b"), 0.10);
    }

    private static final List<String> SENTENCE_TERMINATORS = List.of(". ", "! ", "? ", "\n");

    @Override
    public SpoilerAssessment classify(Long reviewId, Long userId, String text) {
        List<String> sentences = splitSentences(text == null ? "" : text);
        List<SpoilerSentence> tagged = new ArrayList<>();
        double maxScore = 0.0;
        String sanitized = text == null ? "" : text;

        for (int i = 0; i < sentences.size(); i++) {
            String sentence = sentences.get(i);
            double score = scoreSentence(sentence);
            SpoilerLevel level = SpoilerLevel.fromScore(score);
            tagged.add(new SpoilerSentence(i, sentence, round3(score), level));
            if (score > maxScore) maxScore = score;
        }

        SpoilerLevel overall = SpoilerLevel.fromScore(maxScore);
        String sanitizedReview = buildSanitizedReview(sentences, tagged);

        return SpoilerAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spoilerLevel(overall)
                .spoilerScore(BigDecimal.valueOf(round3(maxScore)))
                .spoilerSentences(tagged)
                .sanitizedReview(sanitizedReview)
                .model(MODEL_ID)
                .build();
    }

    @Override
    public String modelId() {
        return MODEL_ID;
    }

    private double scoreSentence(String sentence) {
        if (sentence == null || sentence.isBlank()) return 0.0;
        double score = 0.0;
        for (Map.Entry<Pattern, Double> entry : PATTERNS.entrySet()) {
            Matcher matcher = entry.getKey().matcher(sentence);
            if (matcher.find()) {
                score = Math.max(score, entry.getValue());
            }
        }
        return Math.min(1.0, score);
    }

    private List<String> splitSentences(String text) {
        List<String> out = new ArrayList<>();
        if (text == null || text.isBlank()) return out;
        StringBuilder buf = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            buf.append(c);
            boolean isTerminator = (c == '.' || c == '!' || c == '?');
            boolean hasMore = i + 1 < text.length();
            if (isTerminator && (!hasMore || text.charAt(i + 1) == ' ' || text.charAt(i + 1) == '\n')) {
                String s = buf.toString().trim();
                if (!s.isEmpty()) out.add(s);
                buf.setLength(0);
            }
        }
        String tail = buf.toString().trim();
        if (!tail.isEmpty()) out.add(tail);
        return out;
    }

    private String buildSanitizedReview(List<String> sentences, List<SpoilerSentence> tagged) {
        if (sentences.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sentences.size(); i++) {
            String sentence = sentences.get(i);
            SpoilerLevel level = i < tagged.size() ? tagged.get(i).level() : SpoilerLevel.SAFE;
            if (level == SpoilerLevel.MAJOR_SPOILER) {
                sb.append("[REDACTED]");
            } else {
                sb.append(sentence);
            }
            if (i < sentences.size() - 1) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    private static double round3(double v) {
        return BigDecimal.valueOf(v).setScale(3, RoundingMode.HALF_UP).doubleValue();
    }
}

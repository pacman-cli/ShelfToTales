# Spam Detection Feature — Shelf to Tales

## Overview

Spam detection automatically flags suspicious or spammy reviews on the Shelf to Tales platform using an LLM-based classifier. It runs asynchronously alongside spoiler detection when a user submits a review, without blocking the submission flow.

---

## Architecture

```
User submits review
        │
        ▼
  ReviewService.addReview()
        │
        ├──► Save review to DB
        │
        ├──► SpoilerDetectionService.assessAndPersist()   ← existing
        │
        └──► SpamDetectionService.assessAndPersist()      ← NEW
                    │
                    ▼
            LlmSpamClassifier.classify()
                    │
                    ▼
            POST to OpenRouter / Ollama
            (LLM returns JSON verdict)
                    │
                    ▼
            SpamAssessment saved to spam_assessments table
            Review row updated: isSpam, spamLevel, spamScore
```

---

## Classification Levels

| Level | Meaning | Action |
|-------|---------|--------|
| `SAFE` | Legitimate review | No action |
| `SUSPECTED_SPAM` | Borderline — may be promotional or low-quality | Flagged for review |
| `SPAM` | Confident spam — promotional, bot-generated, gibberish | Hidden from public view |

---

## Spam Indicators Detected

The LLM classifier looks for:

- **Promotional content**: buy links, discount codes, affiliate URLs, "check out my..."
- **Gibberish**: nonsensical text, random characters
- **Repeated patterns**: `aaaa`, `!!!!!!!`, `111111`
- **Off-topic content**: unrelated to books or reading
- **Bot-like patterns**: template responses, generic praise without substance
- **Excessive formatting**: ALL CAPS, excessive punctuation, URL-heavy text

---

## Configuration

In `application.properties`:

```properties
# Enable LLM spam detection (default: llm)
ai.spam.provider=${AI_SPAM_PROVIDER:llm}

# Set to 'none' to disable spam detection entirely
# ai.spam.provider=none
```

The spam classifier uses the same OpenRouter/Ollama endpoint as spoiler detection:

```properties
ai.chat.provider=${AI_CHAT_PROVIDER:openrouter}
ai.chat.api-key=${AI_CHAT_API_KEY:}
ai.chat.model=${AI_CHAT_MODEL:meta-llama/llama-3.1-8b-instruct:free}
ai.chat.base-url=${AI_CHAT_BASE_URL:https://openrouter.ai/api/v1/chat/completions}
```

---

## Database Schema

### reviews table (new columns)

```sql
ALTER TABLE reviews ADD COLUMN is_spam BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE reviews ADD COLUMN spam_level VARCHAR(16) DEFAULT 'SAFE' NOT NULL;
ALTER TABLE reviews ADD COLUMN spam_score DECIMAL(4,3) DEFAULT 0 NOT NULL;
```

### spam_assessments table

```sql
CREATE TABLE spam_assessments (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT,
    spam_level VARCHAR(16) NOT NULL,
    spam_score DECIMAL(4,3) NOT NULL,
    spam_reasons JSONB NOT NULL DEFAULT '[]',
    model VARCHAR(64) NOT NULL,
    latency_ms INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Key Files

| File | Path | Purpose |
|------|------|---------|
| `SpamLevel.java` | `ai/domain/` | Enum: SAFE, SUSPECTED_SPAM, SPAM |
| `SpamAssessment.java` | `ai/domain/` | JPA entity storing LLM verdict |
| `SpamAssessmentRepository.java` | `ai/infrastructure/` | JPA repository |
| `SpamClassifier.java` | `ai/application/` | Interface for classifiers |
| `LlmSpamClassifier.java` | `ai/application/` | LLM-based implementation |
| `SpamDetectionService.java` | `ai/application/` | Orchestrator — persists + mirrors to review |
| `ReviewService.java` | `review/application/` | Calls SpamDetectionService in addReview() |
| `V73__Add_spam_detection.sql` | `db/migration/` | Flyway migration |

---

## How to Test

### 1. Manual API test via curl

```bash
# Submit a normal review (should be SAFE)
curl -X POST http://localhost:8080/api/books/1/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "Great book, really enjoyed the character development!"}'

# Submit a spammy review (should be flagged)
curl -X POST http://localhost:8080/api/books/1/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "BUY NOW!!! Visit http://spam-link.com for 50% OFF!!! Click here for FREE stuff!!!!"}'
```

### 2. Check spam assessment

```bash
# After submitting, check the assessment
curl http://localhost:8080/api/reviews/{reviewId}/spam \
  -H "Authorization: Bearer <token>"
```

### 3. Check database directly

```sql
-- Check spam flags on reviews
SELECT id, comment, is_spam, spam_level, spam_score
FROM reviews
ORDER BY created_at DESC
LIMIT 10;

-- Check detailed assessments
SELECT * FROM spam_assessments
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Automated test cases

```bash
# Test: gibberish review
"asdfghjkl;;;!!!12345"
# Expected: SPAM (score > 0.8)

# Test: promotional review
"Check out my website for cheap books! http://spam.com Use code SPAM20 for 20% off!"
# Expected: SPAM

# Test: normal review
"I loved this book. The characters were deep and the plot kept me guessing."
# Expected: SAFE

# Test: borderline review
"ok book. not great not bad. would recommend."
# Expected: SAFE or SUSPECTED_SPAM (low confidence)
```

---

## How Spam Detection Differs from Spoiler Detection

| Aspect | Spoiler Detection | Spam Detection |
|--------|-------------------|----------------|
| **Purpose** | Protect plot secrets | Block low-quality/bot content |
| **Runs on** | Review text + book context | Review text only |
| **Levels** | SAFE, MINOR_SPOILER, MAJOR_SPOILER | SAFE, SUSPECTED_SPAM, SPAM |
| **Config** | `ai.spoiler.provider` | `ai.spam.provider` |
| **Fallback** | Heuristic classifier | Returns SAFE on error |
| **Blocks submission?** | No | No |

---

## Error Handling

- If the LLM call fails (network, timeout, API error), the classifier returns `SAFE` by default
- Spam detection never blocks review submission — it runs in a try-catch after the review is saved
- Errors are logged but do not propagate to the user

---

## Cost Considerations

Each review submission triggers one LLM call for spam detection. At ~300 max tokens per request:
- **OpenRouter free tier**: sufficient for development/testing
- **Production**: consider batching or rate-limiting to control costs
- **Ollama local**: zero cost, ideal for high-volume deployments

---

## Future Enhancements

1. **Heuristic fallback**: Add rule-based spam detection (regex for URLs, repeated chars) when LLM is unavailable
2. **Rate limiting**: Flag users who post > N reviews per minute
3. **Admin dashboard**: Show flagged reviews for manual approval/rejection
4. **Auto-hide**: Automatically hide reviews with `spam_level = SPAM` from public view
5. **User reputation**: Track spam score per user to adjust trust levels

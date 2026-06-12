# Automated Spoiler Detection Pipeline

## Overview

This document describes the fully automated, event-driven spoiler detection system for Shelf to Tales. When a book is uploaded, the system automatically:
1. Extracts PDF text from R2 storage
2. Indexes book content into PgVector for RAG
3. Registers the book for spoiler model training
4. Collects labeled review data as reviews come in
5. Auto-generates training data when enough reviews exist
6. Triggers model training via Colab (manual or automated)
7. Registers the fine-tuned model for use in spoiler detection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATED SPOILER DETECTION PIPELINE          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BOOK UPLOAD                                                     │
│  ───────────                                                     │
│  Admin uploads book (PDF + metadata)                             │
│       ↓                                                          │
│  BookAdminService.uploadBook()                                   │
│       ↓                                                          │
│  BookUploadedEvent published                                     │
│       ↓                                                          │
│  BookIngestionListener (@EventListener, @Async)                  │
│       ├──→ PdfExtractionService.extractText(r2Key)               │
│       │         ↓                                                │
│       │    Download PDF from R2 → PDFBox → extract text          │
│       │         ↓                                                │
│       │    EmbeddingIndexer.reindexBook(book)                    │
│       │         ↓                                                │
│       │    TextChunker → BookChunk → PgVector embeddings         │
│       │                                                          │
│       └──→ BookSpoilerModelService.registerBook(bookId)          │
│                    ↓                                             │
│            book_spoiler_models table (status: NO_REVIEWS)        │
│                                                                  │
│  REVIEW SUBMISSION                                               │
│  ─────────────────                                               │
│  User submits review                                             │
│       ↓                                                          │
│  ReviewService.addReview()                                       │
│       ↓                                                          │
│  SpoilerDetectionService.assessAndPersist(bookId, text)          │
│       ↓                                                          │
│  SpoilerDetectionService.pickClassifier(bookId)                  │
│       ├──→ If book has fine-tuned model → BookSpoilerClassifier  │
│       │         ↓                                                │
│       │    Calls Ollama: shelf-spoiler-book-{id}                 │
│       │    (fine-tuned on this book's reviews)                   │
│       │                                                          │
│       ├──→ If book has NO model yet → LlmSpoilerClassifier       │
│       │         ↓                                                │
│       │    Calls OpenRouter with book context in prompt           │
│       │                                                          │
│       └──→ Fallback → HeuristicSpoilerClassifier                 │
│                    ↓                                             │
│            SpoilerAssessment saved                               │
│            Review.spoilerLevel updated                           │
│                    ↓                                             │
│  TrainingTriggerService.checkAndTriggerTraining(bookId)          │
│       ↓                                                          │
│  If reviews >= 20 AND labeled data exists:                       │
│       ├──→ Generate JSONL from labeled reviews                   │
│       ├──→ Upload to Google Drive                                │
│       ├──→ Trigger Colab notebook (webhook/API)                  │
│       ├──→ Colab trains LoRA → exports GGUF                      │
│       ├──→ Backend polls Google Drive for GGUF                   │
│       ├──→ Download GGUF → create Ollama model                   │
│       └──→ Update book_spoiler_models (status: ACTIVE)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. AsyncConfig
**Location:** `shared/config/AsyncConfig.java`

Configures Spring `@EnableAsync` with two thread pools:
- `bookIngestionExecutor`: For PDF extraction and book indexing (2-4 threads)
- `modelTrainingExecutor`: For model training orchestration (1-2 threads)

### 2. BookIngestionListener
**Location:** `ai/application/BookIngestionListener.java`

Listens for `BookUploadedEvent` and triggers async ingestion:
- Extracts PDF text from R2 via PDFBox
- Indexes book content into PgVector for RAG
- Registers book for spoiler model tracking
- Generates base training data from book metadata

### 3. PdfExtractionService
**Location:** `ai/infrastructure/PdfExtractionService.java`

Downloads PDFs from Cloudflare R2 and extracts text using Apache PDFBox:
- `extractText(r2ObjectKey)`: Downloads and extracts full text
- `extractTextFromBytes(pdfBytes)`: Extracts from in-memory bytes
- `getPdfUrl(r2ObjectKey)`: Returns public URL for a PDF

### 4. BookSpoilerModelService
**Location:** `ai/application/BookSpoilerModelService.java`

Manages per-book spoiler model lifecycle:
- `registerBook(bookId, title)`: Registers a book for tracking
- `checkTrainingReadiness(bookId)`: Checks if enough reviews exist
- `markTrainingComplete(bookId, ggufDriveFileId)`: Updates status after training
- `getModelName(bookId)`: Returns Ollama model name (or generic fallback)

### 5. TrainingDataGenerator
**Location:** `ai/application/TrainingDataGenerator.java`

Auto-generates JSONL training files from labeled reviews:
- `generateForBook(bookId)`: Uses existing spoiler assessments as training data
- `generateBaseTrainingData(bookId)`: Creates synthetic examples from book metadata

### 6. BookSpoilerClassifier
**Location:** `ai/application/BookSpoilerClassifier.java`

Per-book Ollama classifier that calls fine-tuned models:
- Only active when `ai.spoiler.provider=book-llm`
- Calls `localhost:11434/api/generate` with book-specific model
- Falls back to SAFE on any error (never blocks review submission)

### 7. SpoilerModelRegistry
**Location:** `ai/application/SpoilerModelRegistry.java`

Thread-safe registry that resolves bookId to Ollama model name:
- Caches active model names for fast lookup
- Uses ThreadLocal for current book classification
- `setCurrentBookId(bookId)`: Sets context for classification
- `getModelName(bookId)`: Returns fine-tuned model or generic fallback

### 8. TrainingTriggerService
**Location:** `ai/application/TrainingTriggerService.java`

Periodically checks if books have enough reviews to trigger training:
- `checkAndTriggerTraining(bookId)`: Manual trigger on review submission
- `scheduledTrainingCheck()`: Runs every hour via `@Scheduled`

### 9. ColabTrainingService
**Location:** `ai/application/ColabTrainingService.java`

Integration with Google Colab for model training:
- `triggerTraining(bookId, modelName, path)`: Triggers Colab webhook
- `checkTrainingStatus(bookId)`: Polls for training completion
- `getColabNotebookUrl(bookId, modelName)`: Returns notebook URL

### 10. TrainingWebhookController
**Location:** `ai/presentation/TrainingWebhookController.java`

Webhook endpoint for Colab to notify when training is complete:
- `POST /api/ai/webhooks/training-complete`: Colab calls this when done
- `POST /api/ai/webhooks/training-failed`: Colab calls this on failure
- `GET /api/ai/webhooks/books/{bookId}/model-status`: Check model status
- `POST /api/ai/webhooks/books/{bookId}/check-training`: Manual trigger

## Configuration

Add these properties to `application.properties`:

```properties
# AI Spoiler Classification
# Options: heuristic, llm, book-llm
ai.spoiler.provider=${AI_SPOILER_PROVIDER:heuristic}
ai.spoiler.min-training-reviews=${AI_SPOILER_MIN_TRAINING_REVIEWS:20}

# Book-specific spoiler model training
ai.spoiler.training-dir=${AI_SPOILER_TRAINING_DIR:./training-data}
ai.spoiler.colab.enabled=${AI_SPOILER_COLAB_ENABLED:false}
ai.spoiler.colab.webhook-url=${AI_SPOILER_COLAB_WEBHOOK_URL:}
ai.spoiler.colab.drive-folder=${AI_SPOILER_COLAB_DRIVE_FOLDER:shelftotales-training}
```

## Database Migration

**V74__Create_book_spoiler_models_table.sql**

```sql
CREATE TABLE book_spoiler_models (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL UNIQUE,
    ollama_model_name VARCHAR(128) NOT NULL,
    status          VARCHAR(24) NOT NULL DEFAULT 'NO_REVIEWS',
    training_example_count INTEGER,
    model_version   VARCHAR(32),
    last_trained_at TIMESTAMPTZ,
    gguf_drive_file_id VARCHAR(256),
    training_jsonl_path VARCHAR(512),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_spoiler_models_book
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## Colab Notebook

**Location:** `scripts/spoiler-training-colab.py`

This Python script runs in Google Colab and:
1. Watches a Google Drive folder for new training JSONL files
2. Trains LoRA adapters using unsloth
3. Exports to GGUF format
4. Notifies the backend via webhook

### Setup

1. Upload `spoiler-training-colab.py` to Google Colab
2. Mount Google Drive
3. Set `WEBHOOK_URL` to your backend webhook endpoint
4. Enable GPU runtime (T4 recommended)
5. Run the notebook

### Training Data Format

```json
{
  "messages": [
    {"role": "system", "content": "You are a spoiler detection model for the book..."},
    {"role": "user", "content": "Review text here..."},
    {"role": "assistant", "content": "{\"level\": \"SAFE\", \"score\": 0.15, \"reasoning\": \"...\"}"}
  ]
}
```

## Usage

### 1. Enable Book-Specific Models

```bash
export AI_SPOILER_PROVIDER=book-llm
```

### 2. Upload a Book

```bash
curl -X POST http://localhost:8080/api/admin/books/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=The Great Gatsby" \
  -F "author=F. Scott Fitzgerald" \
  -F "file=@gatsby.pdf"
```

The system will automatically:
- Extract PDF text
- Index into PgVector
- Register for spoiler model tracking

### 3. Reviews Accumulate

As users submit reviews, the system:
- Runs spoiler detection (using heuristic/LLM)
- Labels reviews with spoiler levels
- Counts labeled reviews per book

### 4. Training Triggered

When a book reaches 20+ labeled reviews:
- Training JSONL is auto-generated
- Colab notebook is triggered (if enabled)
- Model is trained and registered

### 5. New Reviews Use Fine-Tuned Model

Once trained, new reviews for that book automatically use the fine-tuned model:
- `BookSpoilerClassifier` calls `shelf-spoiler-book-{id}`
- Falls back to generic LLM if model unavailable
- Falls back to heuristic if LLM unavailable

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/webhooks/training-complete` | POST | Colab notifies training complete |
| `/api/ai/webhooks/training-failed` | POST | Colab notifies training failure |
| `/api/ai/webhooks/books/{bookId}/model-status` | GET | Check model status |
| `/api/ai/webhooks/books/{bookId}/check-training` | POST | Manual training trigger |
| `/api/reviews/{reviewId}/spoiler-check` | POST | Re-run spoiler detection |
| `/api/reviews/{reviewId}/spoiler` | GET | Get spoiler assessment |

## Model Status Flow

```
NO_REVIEWS → COLLECTING_DATA → READY_TO_TRAIN → TRAINING → ACTIVE
                                    ↓
                              TRAINING_FAILED
```

## Fallback Chain

```
book-llm (fine-tuned Ollama model)
    ↓ (if not available)
llm (generic OpenRouter LLM)
    ↓ (if not available)
heuristic (regex-based classifier)
```

## Monitoring

Check model status:
```bash
curl http://localhost:8080/api/ai/webhooks/books/123/model-status
```

Response:
```json
{
  "bookId": 123,
  "modelName": "shelf-spoiler-book-123",
  "status": "ACTIVE",
  "trainingExampleCount": 25,
  "lastTrainedAt": "2024-01-15T10:30:00Z",
  "hasActiveModel": true
}
```

## Troubleshooting

### Training not triggering
- Check `ai.spoiler.min-training-reviews` (default: 20)
- Verify reviews have spoiler assessments
- Check logs for "Book ready for training"

### Colab not connecting
- Verify `ai.spoiler.colab.webhook-url` is set
- Check Colab notebook is running
- Verify Google Drive mount is working

### Model not being used
- Check `ai.spoiler.provider=book-llm`
- Verify model status is `ACTIVE`
- Check Ollama is running: `ollama list`

### PDF extraction failing
- Verify R2 credentials are configured
- Check PDF file exists in R2 bucket
- Check logs for PDFBox errors

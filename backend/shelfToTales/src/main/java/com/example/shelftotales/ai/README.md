# AI-Powered Spoiler Detection System

This module implements a pluggable, multi-tiered spoiler classification and moderation pipeline for book reviews in **ShelfToTales**. The system combines fast rule-based filters, LLMs, fine-tuned book-specific classifiers, and Retrieval-Augmented Generation (RAG) to ensure an optimal balance between low response latency and high classification accuracy.

---

## 1. System Architecture

The pipeline operates across both the frontend and backend:

1. **Frontend Blur & Warning**: Reviews flagged as spoilers are automatically blurred (`filter: blur(5px)`) in the social feed, showing a `⚠️ Spoiler Warning` button overlay. Users can click to reveal the full review comments.
2. **Backend Moderation Flow**: Reviews are saved instantly upon submission. Assessment runs in the background (or synchronously) to flag spoilers (`isSpoiler` flag and `spoilerLevel` status) and sanitize major spoilers with `[REDACTED]` tokens.

---

## 2. Pluggable Spoiler Detection Strategies

The system selects a strategy based on configuration properties (`ai.spoiler.provider`) and book model registry availability:

| Strategy | Engine / Tech | How it works | Context-Awareness | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Heuristic Classifier** | RegEx & Weighted Keywords | Analyzes text at the sentence level against weighted regular expression patterns (e.g. `dies`, `plot twist`, `killer is`). | **Low** (Static keywords) | Low-cost, instant fallback during network/API failures. |
| 🌐 **Generic LLM** | Spring REST & OpenRouter | Sends the review comment to a remote LLM (e.g., Llama 3.1 8B) for structured JSON evaluation (level, score, sentence-level analysis, sanitized text). | **Medium** (LLM pre-trained knowledge) | General sentiment and standard plot twists detection. |
| 🎯 **Book-Specific LLM** | Ollama (Local GGUF models) | Loads a local model specifically fine-tuned for the book (`book-llm-<bookId>`). Google Colab triggers fine-tuning webhook when training threshold is met. | **High** (Fine-tuned vocabulary) | Titles with highly specific spoiler contexts and character names. |
| 📚 **Context-Aware RAG** | Vector Store Similarity | Queries PGvector database using review text to find matching book chunks. Cross-references the review against retrieved book chapters. | **Very High** (Direct match against book content) | Deep semantic plot points and subtle character fate reveals. |

---

## 3. Data Flow Diagram

```mermaid
graph TD
    A[Review Submitted] --> B{Strategy Configured?}
    B -->|book-llm| C[Ollama Local Model]
    B -->|llm| D[Generic LLM / OpenRouter]
    B -->|rag| E[Vector Store Context Similarity]
    B -->|heuristic| F[Heuristic Regex Parser]
    
    C --> G[Spoiler Assessment Persisted]
    D --> G
    E --> G
    F --> G
    
    G --> H[Update Review Spoiler Flags]
    H --> I[Sanitize Major Spoilers [REDACTED]]
    I --> J[Check Fine-Tuning Training Readiness]
```

---

## 4. Configuration Properties

Add or modify these settings in your `application.properties` to choose the desired detection strategy:

```properties
# Classifier strategy: heuristic, llm, or book-llm
ai.spoiler.provider=heuristic

# OpenRouter / OpenAI chat configurations (Strategy: llm)
ai.chat.api-key=your-api-key
ai.chat.model=meta-llama/llama-3.1-8b-instruct:free
ai.chat.base-url=https://openrouter.ai/api/v1/chat/completions

# Local Ollama endpoint configuration (Strategy: book-llm)
spring.ai.ollama.base-url=http://localhost:11434

# Fine-tuning pipelines
ai.spoiler.colab.enabled=false
ai.spoiler.colab.webhook-url=
ai.spoiler.colab.drive-folder=shelftotales-training
```

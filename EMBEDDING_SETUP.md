# Embedding Setup Guide

## Free Embedding Providers

Your Knowledge Engine supports multiple embedding providers. By default, it uses **Hugging Face** (free).

### Option 1: Hugging Face (FREE - Recommended)

**Free Tier:** 1,000 requests/day  
**Model:** `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)  
**Quality:** Good for semantic similarity  
**Speed:** Fast

#### Setup:

1. **Get a free API token:**
   - Go to https://huggingface.co/settings/tokens
   - Create a new token (read access is enough)
   - Copy the token

2. **Add to `.env`:**
   ```env
   EMBEDDING_PROVIDER=huggingface
   HUGGING_FACE_API_KEY=your_token_here
   HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   ```

3. **Run the embedding job:**
   ```bash
   npm run knowledge:embed
   ```

**Note:** You can use Hugging Face **without** an API key for limited testing, but you'll get rate limits. A free token removes most limits.

---

### Option 2: OpenAI (Paid)

**Cost:** ~$0.13 per 1M tokens  
**Model:** `text-embedding-3-large` (1536 dimensions)  
**Quality:** Excellent  
**Speed:** Very fast

#### Setup:

1. **Get API key from:** https://platform.openai.com/api-keys

2. **Add to `.env`:**
   ```env
   EMBEDDING_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   KNOWLEDGE_EMBEDDING_MODEL=text-embedding-3-large
   ```

3. **Run the embedding job:**
   ```bash
   npm run knowledge:embed
   ```

---

## Model Comparison

| Provider | Model | Dimensions | Free Tier | Quality |
|----------|-------|------------|----------|---------|
| Hugging Face | all-MiniLM-L6-v2 | 384 | 1,000/day | Good |
| Hugging Face | all-mpnet-base-v2 | 768 | 1,000/day | Better |
| OpenAI | text-embedding-3-large | 1536 | Paid | Excellent |

---

## Switching Providers

If you switch providers, you'll need to:

1. **Clear existing embeddings** (they have different dimensions):
   ```sql
   DELETE FROM knowledge_event_embeddings;
   ```

2. **Update `.env`** with new provider settings

3. **Re-run embedding job:**
   ```bash
   npm run knowledge:embed
   ```

---

## Troubleshooting

### "429 You exceeded your current quota"
- **OpenAI:** You've hit your usage limit. Switch to Hugging Face (free).
- **Hugging Face:** You've hit the 1,000/day limit. Wait 24 hours or get a free token.

### "Invalid vector dimension"
- Different providers use different dimensions. Clear old embeddings and re-run.

### "Model is currently loading"
- Hugging Face free tier loads models on-demand. Wait 10-20 seconds and retry.

---

## Recommended Setup for Testing

For development/testing, use **Hugging Face** (free):

```env
EMBEDDING_PROVIDER=huggingface
HUGGING_FACE_API_KEY=your_free_token
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

This gives you:
- ✅ Free embeddings
- ✅ 1,000 requests/day (plenty for testing)
- ✅ Good semantic similarity
- ✅ No credit card required







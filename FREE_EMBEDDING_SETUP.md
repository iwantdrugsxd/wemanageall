# Free Embedding Setup - Quick Guide

## ✅ Solution: Get a Free Hugging Face Token (2 minutes)

The embedding system now uses **Hugging Face** (free) instead of OpenAI.

### Step 1: Get Free Token

1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name it: `ofa-embeddings`
4. Select **"Read"** permission
5. Click **"Generate token"**
6. **Copy the token** (starts with `hf_...`)

### Step 2: Add to `.env`

Add this line to your `.env` file:

```env
EMBEDDING_PROVIDER=huggingface
HUGGING_FACE_API_KEY=hf_your_token_here
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Step 3: Run Embedding Job

```bash
npm run knowledge:embed
```

That's it! 🎉

---

## Free Tier Limits

- **Without token:** Very limited (may not work reliably)
- **With free token:** 1,000 requests/day (plenty for testing)
- **Cost:** $0 (completely free)

---

## Alternative: Use Without Token (Limited)

If you don't want to create a token, the system will try to work without one, but you may hit rate limits. The embedding job will show clear errors if this happens.

---

## Troubleshooting

### "HTTP error occurred"
- Make sure your `.env` file has `HUGGING_FACE_API_KEY` set
- Verify the token is correct (starts with `hf_`)
- Try running the job again

### "Model is loading"
- Wait 10-20 seconds and run again
- First request loads the model (one-time delay)

### "429 Rate limit"
- You've hit the 1,000/day limit
- Wait 24 hours or get a paid token

---

## Why Hugging Face?

- ✅ **Free** (no credit card needed)
- ✅ **1,000 requests/day** (plenty for development)
- ✅ **Good quality** embeddings (384 dimensions)
- ✅ **Fast** and reliable
- ✅ **No quotas** to worry about for testing







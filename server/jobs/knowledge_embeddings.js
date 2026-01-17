import dotenv from 'dotenv';
import { query } from '../db/config.js';
import { getEventsWithoutEmbeddings, saveEventEmbedding } from '../services/knowledge.js';

dotenv.config();

// Choose provider: 'openai' or 'huggingface'
const PROVIDER = process.env.EMBEDDING_PROVIDER || 'huggingface';
const OPENAI_MODEL = process.env.KNOWLEDGE_EMBEDDING_MODEL || 'text-embedding-3-large';
const HF_MODEL = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Get embeddings using OpenAI
 */
async function getOpenAIEmbeddings(texts) {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.embeddings.create({
    model: OPENAI_MODEL,
    input: texts,
  });

  return response.data.map(item => item.embedding);
}

/**
 * Get embeddings using Hugging Face Inference API (FREE)
 * Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
 * Free tier: Works without API key (with rate limits) or 1,000 requests/day with free token
 * 
 * Uses official @huggingface/inference library which handles endpoint changes automatically
 */
async function getHuggingFaceEmbeddings(texts) {
  const { HfInference } = await import('@huggingface/inference');
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  
  const hf = new HfInference(apiKey);

  // Process texts one at a time (more reliable for free tier)
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    
    try {
      // Use feature extraction endpoint
      const response = await hf.featureExtraction({
        model: HF_MODEL,
        inputs: text,
      });

      // Response is already an array of numbers
      if (Array.isArray(response) && typeof response[0] === 'number') {
        allEmbeddings.push(response);
      } else if (Array.isArray(response) && Array.isArray(response[0])) {
        // Sometimes returns nested array
        allEmbeddings.push(response[0]);
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(response).substring(0, 100)}`);
      }

      console.log(`  ✅ Embedded: ${text.substring(0, 50)}... (${i + 1}/${texts.length})`);

      // Small delay to avoid rate limits (especially without API key)
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      // If model is loading, wait and retry
      if (error.message?.includes('503') || error.message?.includes('loading')) {
        console.log(`  ⏳ Model loading, waiting 10s... (${i + 1}/${texts.length})`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Retry once
        try {
          const retryResponse = await hf.featureExtraction({
            model: HF_MODEL,
            inputs: text,
          });
          
          if (Array.isArray(retryResponse) && typeof retryResponse[0] === 'number') {
            allEmbeddings.push(retryResponse);
            console.log(`  ✅ Embedded (retry): ${text.substring(0, 50)}... (${i + 1}/${texts.length})`);
            continue;
          }
        } catch (retryError) {
          console.error(`  ❌ Failed to embed text ${i + 1} (retry failed): ${retryError.message}`);
          throw retryError;
        }
      } else {
        console.error(`  ❌ Failed to embed text ${i + 1}: ${error.message}`);
        throw error;
      }
    }
  }

  return allEmbeddings;
}

async function run() {
  console.log('\n🔄 Knowledge Embedding Job');
  console.log('============================\n');
  console.log(`Provider: ${PROVIDER}`);
  console.log(`Model: ${PROVIDER === 'openai' ? OPENAI_MODEL : HF_MODEL}\n`);

  try {
    // Quick connectivity check
    await query('SELECT 1');

    const events = await getEventsWithoutEmbeddings(128);

    if (!events.length) {
      console.log('No new knowledge events to embed.');
      return;
    }

    console.log(`Embedding ${events.length} knowledge events...`);

    const inputs = events.map((e) => e.content);

    let embeddings;
    if (PROVIDER === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set. Set it in .env or switch to huggingface provider.');
      }
      embeddings = await getOpenAIEmbeddings(inputs);
    } else {
      // Hugging Face (free)
      embeddings = await getHuggingFaceEmbeddings(inputs);
    }

    if (!embeddings || embeddings.length !== events.length) {
      console.error(`Embedding response length mismatch. Expected ${events.length}, got ${embeddings?.length || 0}`);
      return;
    }

    for (let i = 0; i < events.length; i++) {
      await saveEventEmbedding(events[i].id, embeddings[i]);
      console.log(`  ✅ Embedded: ${events[i].content.substring(0, 50)}...`);
    }

    console.log(`\n✅ Stored embeddings for ${events.length} knowledge events.`);
  } catch (error) {
    console.error('❌ Knowledge embedding job failed:', error.message || error);
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      console.error('\n💡 Tip: Switch to Hugging Face (free) by setting:');
      console.error('   EMBEDDING_PROVIDER=huggingface');
      console.error('   Get free API key at: https://huggingface.co/settings/tokens\n');
    }
  }

  console.log('\nDone.\n');
}

run();



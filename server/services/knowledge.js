import { query } from '../db/config.js';

let knowledgeTablesInitialized = false;
let embeddingsInitialized = false;

const initKnowledgeTables = async () => {
  if (knowledgeTablesInitialized) return;

  try {
    // Core events table
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source TEXT NOT NULL,              -- e.g. 'today:reflection', 'projects:task_completed'
        event_type TEXT NOT NULL,          -- e.g. 'create', 'update', 'delete', 'log'
        content TEXT NOT NULL,             -- normalized human-readable text
        timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        project_id UUID NULL,
        mood TEXT NULL,
        sentiment TEXT NULL,               -- to be filled by later intelligence jobs
        intensity INTEGER NULL,            -- 1–5, optional
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        raw_metadata JSONB DEFAULT '{}'::JSONB
      )
    `);

    // Simple index for user/time queries
    await query(`CREATE INDEX IF NOT EXISTS idx_knowledge_events_user_time ON knowledge_events(user_id, timestamp DESC)`);

    // Insights table
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_insights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scope TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        sources UUID[] DEFAULT ARRAY[]::UUID[],
        confidence REAL DEFAULT 0.0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        seen_at TIMESTAMPTZ NULL,
        dismissed_at TIMESTAMPTZ NULL,
        muted BOOLEAN DEFAULT FALSE,
        meta JSONB DEFAULT '{}'::JSONB
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_knowledge_insights_user_scope ON knowledge_insights(user_id, scope, created_at DESC)`);

    knowledgeTablesInitialized = true;
    console.log('✅ Knowledge events table initialized');
  } catch (error) {
    console.error('Error initializing knowledge tables:', error);
    // Do not throw – we don't want to break core flows if knowledge layer fails
  }
};

const initEmbeddingsTable = async () => {
  if (embeddingsInitialized) return;

  try {
    // Enable pgvector extension if available
    await query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'knowledge_event_embeddings'
      )
    `);

    const tableExists = tableCheck.rows[0]?.exists;

    if (!tableExists) {
      // Create table with flexible dimension (will be set by first embedding)
      // Using 384 as default (Hugging Face all-MiniLM-L6-v2)
      await query(`
        CREATE TABLE knowledge_event_embeddings (
          event_id UUID PRIMARY KEY REFERENCES knowledge_events(id) ON DELETE CASCADE,
          embedding vector(384) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created knowledge_event_embeddings table');
    } else {
      // Table exists - check if we need to alter dimension
      // Note: pgvector doesn't support ALTER COLUMN for vector dimensions easily
      // So we'll use the existing dimension or recreate if needed
      const colCheck = await query(`
        SELECT data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'knowledge_event_embeddings' 
        AND column_name = 'embedding'
      `);
      
      if (colCheck.rows.length === 0) {
        // Column doesn't exist, add it
        await query(`
          ALTER TABLE knowledge_event_embeddings 
          ADD COLUMN embedding vector(384) NOT NULL
        `);
      }
    }

    // Optional index for similarity search (only if we have enough data)
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_vector
        ON knowledge_event_embeddings
        USING ivfflat (embedding vector_l2_ops)
        WITH (lists = 100)
      `);
    } catch (indexError) {
      // Index might fail if table is empty or dimension mismatch
      // That's okay, we'll recreate it later if needed
      console.warn('Could not create vector index (this is normal for empty tables):', indexError.message);
    }

    embeddingsInitialized = true;
    console.log('✅ Knowledge embeddings table initialized');
  } catch (error) {
    console.error('Error initializing knowledge embeddings (pgvector may not be installed):', error.message || error);
    // Do not throw – embeddings are an enhancement, not critical path
  }
};

/**
 * Create a knowledge event from any feature.
 * This is intentionally forgiving: failures are logged but won't block the main request.
 */
export const createKnowledgeEvent = async ({
  userId,
  source,
  eventType,
  content,
  timestamp = new Date(),
  projectId = null,
  mood = null,
  rawMetadata = {},
}) => {
  if (!userId || !source || !eventType || !content) {
    return;
  }

  try {
    await initKnowledgeTables();

    await query(
      `INSERT INTO knowledge_events
        (user_id, source, event_type, content, timestamp, project_id, mood, raw_metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        source,
        eventType,
        content,
        timestamp,
        projectId,
        mood,
        rawMetadata || {},
      ]
    );
  } catch (error) {
    // Log but don't break the user flow
    console.error('Failed to create knowledge event:', error.message || error);
  }
};

/**
 * Fetch events that don't yet have embeddings.
 * Used by background jobs to keep the vector store in sync.
 */
export const getEventsWithoutEmbeddings = async (limit = 128) => {
  await initKnowledgeTables();
  await initEmbeddingsTable();

  try {
    const result = await query(
      `
      SELECT e.id, e.user_id, e.source, e.content, e.timestamp
      FROM knowledge_events e
      LEFT JOIN knowledge_event_embeddings ke ON ke.event_id = e.id
      WHERE ke.event_id IS NULL
      ORDER BY e.timestamp DESC
      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Failed to fetch events without embeddings:', error.message || error);
    return [];
  }
};

/**
 * Save an embedding vector for a given event.
 */
export const saveEventEmbedding = async (eventId, embeddingArray) => {
  if (!eventId || !embeddingArray || !Array.isArray(embeddingArray)) return;

  await initKnowledgeTables();
  await initEmbeddingsTable();

  try {
    await query(
      `
      INSERT INTO knowledge_event_embeddings (event_id, embedding)
      VALUES ($1, $2)
      ON CONFLICT (event_id) DO UPDATE SET embedding = EXCLUDED.embedding, created_at = CURRENT_TIMESTAMP
      `,
      [eventId, embeddingArray]
    );
  } catch (error) {
    console.error('Failed to save event embedding:', error.message || error);
  }
};


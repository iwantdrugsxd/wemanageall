import dotenv from 'dotenv';
import { query } from '../db/config.js';
import { createKnowledgeEvent } from '../services/knowledge.js';

dotenv.config();

// Initialize insights table
async function initInsightsTable() {
  try {
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
  } catch (error) {
    console.error('Error initializing insights table:', error);
  }
}

/**
 * Generate insights from knowledge events
 * 
 * This is a simple pattern detection job that:
 * 1. Analyzes recent knowledge events
 * 2. Detects patterns (mood patterns, productivity patterns, spending patterns)
 * 3. Generates human-readable insights
 * 4. Stores them in knowledge_insights table
 * 
 * For now, this uses simple rule-based pattern detection.
 * Later, this can be enhanced with LLM-based reflection generation.
 */
async function generateInsights() {
  console.log('\n🧠 Generating Insights');
  console.log('=====================\n');

  try {
    // Initialize insights table
    await initInsightsTable();
    // Get all users
    const usersResult = await query('SELECT id FROM users');
    const users = usersResult.rows;

    for (const user of users) {
      const userId = user.id;
      console.log(`Processing user: ${userId}`);

      // Get recent knowledge events (last 30 days)
      const eventsResult = await query(
        `SELECT id, source, content, mood, timestamp, project_id
         FROM knowledge_events
         WHERE user_id = $1
           AND timestamp >= NOW() - INTERVAL '30 days'
         ORDER BY timestamp DESC`,
        [userId]
      );

      const events = eventsResult.rows;

      if (events.length < 5) {
        console.log(`  ⏭️  Not enough events (${events.length}), skipping`);
        continue;
      }

      // Pattern 1: Mood patterns
      const moodEvents = events.filter(e => e.mood);
      if (moodEvents.length >= 3) {
        const moodCounts = {};
        moodEvents.forEach(e => {
          moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        });

        const topMood = Object.entries(moodCounts)
          .sort((a, b) => b[1] - a[1])[0];

        if (topMood[1] >= 3) {
          // Check if we already have this insight
          const existing = await query(
            `SELECT id FROM knowledge_insights
             WHERE user_id = $1
               AND scope = 'emotion'
               AND title LIKE $2
               AND created_at >= NOW() - INTERVAL '7 days'`,
            [userId, `%${topMood[0]}%`]
          );

          if (existing.rows.length === 0) {
            const insight = generateMoodInsight(topMood[0], topMood[1], moodEvents.length);
            await query(
              `INSERT INTO knowledge_insights (user_id, scope, title, body, confidence, sources, meta)
               VALUES ($1, 'emotion', $2, $3, $4, $5, $6)`,
              [
                userId,
                insight.title,
                insight.body,
                0.7, // Confidence
                moodEvents.slice(0, 5).map(e => e.id),
                { mood: topMood[0], count: topMood[1], total: moodEvents.length },
              ]
            );
            console.log(`  ✅ Generated mood insight: ${insight.title}`);
          }
        }
      }

      // Pattern 2: Reflection patterns
      const reflections = events.filter(e => e.source === 'today:reflection');
      if (reflections.length >= 5) {
        // Check for productivity patterns
        const productiveReflections = reflections.filter(r =>
          r.content.toLowerCase().includes('productive') ||
          r.content.toLowerCase().includes('focused') ||
          r.content.toLowerCase().includes('accomplished')
        );

        if (productiveReflections.length >= 3) {
          const existing = await query(
            `SELECT id FROM knowledge_insights
             WHERE user_id = $1
               AND scope = 'daily'
               AND title LIKE '%productive%'
               AND created_at >= NOW() - INTERVAL '7 days'`,
            [userId]
          );

          if (existing.rows.length === 0) {
            const insight = generateProductivityInsight(productiveReflections, reflections);
            await query(
              `INSERT INTO knowledge_insights (user_id, scope, title, body, confidence, sources, meta)
               VALUES ($1, 'daily', $2, $3, $4, $5, $6)`,
              [
                userId,
                insight.title,
                insight.body,
                0.6,
                productiveReflections.slice(0, 3).map(e => e.id),
                { pattern: 'productivity', count: productiveReflections.length },
              ]
            );
            console.log(`  ✅ Generated productivity insight`);
          }
        }
      }

      // Pattern 3: Spending patterns
      const expenses = events.filter(e => e.source === 'money:expense');
      if (expenses.length >= 5) {
        // Check for spending on specific days
        const weekendExpenses = expenses.filter(e => {
          const day = new Date(e.timestamp).getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });

        if (weekendExpenses.length >= 3) {
          const existing = await query(
            `SELECT id FROM knowledge_insights
             WHERE user_id = $1
               AND scope = 'money'
               AND title LIKE '%weekend%'
               AND created_at >= NOW() - INTERVAL '7 days'`,
            [userId]
          );

          if (existing.rows.length === 0) {
            const insight = {
              title: 'Weekend spending pattern',
              body: `I noticed you tend to spend more on weekends. That's ${weekendExpenses.length} out of ${expenses.length} expenses. Want to explore if that's intentional?`,
            };
            await query(
              `INSERT INTO knowledge_insights (user_id, scope, title, body, confidence, sources, meta)
               VALUES ($1, 'money', $2, $3, $4, $5, $6)`,
              [
                userId,
                insight.title,
                insight.body,
                0.65,
                weekendExpenses.slice(0, 3).map(e => e.id),
                { pattern: 'weekend_spending', count: weekendExpenses.length },
              ]
            );
            console.log(`  ✅ Generated spending insight`);
          }
        }
      }

      // Pattern 4: Project completion patterns
      const taskCompletions = events.filter(e => e.source === 'projects:task_completed');
      if (taskCompletions.length >= 3) {
        // Check time of day patterns
        const morningCompletions = taskCompletions.filter(e => {
          const hour = new Date(e.timestamp).getHours();
          return hour >= 6 && hour < 12;
        });

        if (morningCompletions.length >= 2) {
          const existing = await query(
            `SELECT id FROM knowledge_insights
             WHERE user_id = $1
               AND scope = 'project'
               AND title LIKE '%morning%'
               AND created_at >= NOW() - INTERVAL '7 days'`,
            [userId]
          );

          if (existing.rows.length === 0) {
            const insight = {
              title: 'Morning productivity pattern',
              body: `You've completed ${morningCompletions.length} tasks in the morning recently. Maybe that's when you're most focused?`,
            };
            await query(
              `INSERT INTO knowledge_insights (user_id, scope, title, body, confidence, sources, meta)
               VALUES ($1, 'project', $2, $3, $4, $5, $6)`,
              [
                userId,
                insight.title,
                insight.body,
                0.6,
                morningCompletions.slice(0, 3).map(e => e.id),
                { pattern: 'morning_productivity', count: morningCompletions.length },
              ]
            );
            console.log(`  ✅ Generated project insight`);
          }
        }
      }
    }

    console.log('\n✅ Insight generation complete\n');
  } catch (error) {
    console.error('❌ Insight generation failed:', error.message || error);
  }
}

function generateMoodInsight(mood, count, total) {
  const moodMessages = {
    overwhelmed: {
      title: 'Feeling overwhelmed pattern',
      body: `I noticed you've felt overwhelmed ${count} times recently. Want to explore what's behind it?`,
    },
    focused: {
      title: 'Focus pattern detected',
      body: `You've felt focused ${count} times recently. What helps you get into that state?`,
    },
    grateful: {
      title: 'Gratitude moments',
      body: `You've expressed gratitude ${count} times recently. That's a good sign. What's making you feel grateful?`,
    },
    frustrated: {
      title: 'Frustration pattern',
      body: `I noticed some frustration (${count} times). Want to talk about what's causing it?`,
    },
  };

  return moodMessages[mood] || {
    title: `Mood pattern: ${mood}`,
    body: `You've felt ${mood} ${count} times recently. Want to explore that pattern?`,
  };
}

function generateProductivityInsight(productiveReflections, allReflections) {
  // Check what days/times were most productive
  const productiveDays = productiveReflections.map(r => {
    const date = new Date(r.timestamp);
    return {
      day: date.getDay(),
      hour: date.getHours(),
    };
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostCommonDay = dayNames[productiveDays[0]?.day || 0];

  return {
    title: 'Productivity pattern',
    body: `You've felt most productive on ${mostCommonDay}s recently. Maybe that's when you're in your flow?`,
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateInsights().then(() => process.exit(0));
}

export { generateInsights };


import dotenv from 'dotenv';
import { query } from './config.js';
import { createKnowledgeEvent } from '../services/knowledge.js';

dotenv.config();

/**
 * Seed the Personal Knowledge Engine with realistic events
 * for the demo user (demo@ofa.app).
 */
async function seedKnowledge() {
  console.log('\n🧠 Seeding Knowledge Events for Demo User');
  console.log('=======================================\n');

  try {
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@ofa.app']
    );

    if (!existing.length) {
      throw new Error('Demo user not found. Run "npm run db:seed" first.');
    }

    const userId = existing[0].id;
    console.log(`✅ Using demo user (id=${userId})`);

    // Clear old events for a clean run
    await query('DELETE FROM knowledge_events WHERE user_id = $1', [userId]);
    console.log('🧹 Cleared existing knowledge events for demo user');

    const now = new Date();
    const daysAgo = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const events = [
      { source: 'today:reflection', eventType: 'upsert', content: 'Felt scattered in the morning but got clarity after writing my priorities. Energy picked up after lunch.', timestamp: daysAgo(0), mood: 'calm' },
      { source: 'today:reflection', eventType: 'upsert', content: 'Heavy day. Too many tabs, too many ideas. Notice I felt better after going for a walk.', timestamp: daysAgo(1), mood: 'overwhelmed' },
      { source: 'today:reflection', eventType: 'upsert', content: 'Deep focus session on the project. Lost track of time in a good way. Social battery a bit low.', timestamp: daysAgo(2), mood: 'focused' },
      { source: 'money:expense', eventType: 'create', content: 'Logged a food expense: ₹420 for dinner with friends. Felt happy and relaxed about this spend.', timestamp: daysAgo(0), mood: 'light' },
      { source: 'money:expense', eventType: 'create', content: 'Paid a surprise subscription renewal. Felt a bit annoyed that I forgot this was coming.', timestamp: daysAgo(3), mood: 'annoyed' },
      { source: 'money:subscription', eventType: 'update', content: 'Cancelled an unused tool subscription to reduce monthly obligations. Felt responsible and lighter.', timestamp: daysAgo(4), mood: 'relieved' },
      { source: 'projects:task_completed', eventType: 'create', content: 'Completed the core dashboard layout for the Life OS project. Felt proud of visual clarity.', timestamp: daysAgo(1), mood: 'satisfied' },
      { source: 'projects:task_blocked', eventType: 'log', content: 'Got stuck integrating authentication with projects workspace. Energy dropped and procrastinated.', timestamp: daysAgo(2), mood: 'stuck' },
      { source: 'projects:planning', eventType: 'create', content: 'Re-scoped the week into one focus project and two small supporting tasks. Felt more in control.', timestamp: daysAgo(5), mood: 'clear' },
      { source: 'emotions:dump', eventType: 'create', content: 'Brain feels noisy. So many things I want to build. Afraid of not finishing anything meaningful.', timestamp: daysAgo(3), mood: 'anxious' },
      { source: 'emotions:dump', eventType: 'create', content: 'Grateful for the progress so far. Even small steps on the project make the future feel more solid.', timestamp: daysAgo(6), mood: 'grateful' },
    ];

    let count = 0;
    for (const e of events) {
      await createKnowledgeEvent({
        userId,
        source: e.source,
        eventType: e.eventType,
        content: e.content,
        timestamp: e.timestamp,
        projectId: null,
        mood: e.mood,
        rawMetadata: {},
      });
      count += 1;
    }

    console.log(`✅ Inserted ${count} knowledge events for demo user`);
    console.log('\nNext:');
    console.log('  npm run knowledge:embed');
    console.log('  npm run knowledge:demo');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Knowledge seeding failed:', error.message || error);
    process.exit(1);
  }
}

seedKnowledge();


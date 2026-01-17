import dotenv from 'dotenv';
import { query } from '../db/config.js';

dotenv.config();

async function runDemo() {
  console.log('\n🧠 Knowledge Semantic Demo');
  console.log('==========================\n');

  try {
    const userRes = await query('SELECT id FROM users WHERE email = $1', [
      'demo@ofa.app',
    ]);

    if (!userRes.rows.length) {
      throw new Error('Demo user not found. Run "npm run db:seed" first.');
    }

    const userId = userRes.rows[0].id;
    console.log(`Using demo user (id=${userId})`);

    const anchorRes = await query(
      `
      SELECT e.id, e.source, e.content, e.timestamp
      FROM knowledge_events e
      WHERE e.user_id = $1
      ORDER BY e.timestamp DESC
      LIMIT 1
      `,
      [userId]
    );

    if (!anchorRes.rows.length) {
      console.log('No knowledge events found. Seed first with knowledge:seed.');
      return;
    }

    const anchor = anchorRes.rows[0];

    console.log('\nAnchor event (what we compare against):');
    console.log('--------------------------------------');
    console.log(`Source:   ${anchor.source}`);
    console.log(`When:     ${anchor.timestamp}`);
    console.log(`Content:  ${anchor.content}`);

    const neighborsRes = await query(
      `
      SELECT
        e2.id,
        e2.source,
        e2.content,
        e2.timestamp,
        (ke2.embedding <-> ke1.embedding) AS distance
      FROM knowledge_event_embeddings ke1
      JOIN knowledge_events e1 ON e1.id = ke1.event_id
      JOIN knowledge_event_embeddings ke2 ON ke2.event_id != ke1.event_id
      JOIN knowledge_events e2 ON e2.id = ke2.event_id
      WHERE e1.id = $1
        AND e1.user_id = $2
        AND e2.user_id = $2
      ORDER BY ke2.embedding <-> ke1.embedding ASC
      LIMIT 5
      `,
      [anchor.id, userId]
    );

    if (!neighborsRes.rows.length) {
      console.log('\nNo neighbors found. Did you run `npm run knowledge:embed`?');
      return;
    }

    console.log('\nMost semantically similar events:');
    console.log('---------------------------------');

    neighborsRes.rows.forEach((row, idx) => {
      console.log(`\n#${idx + 1}`);
      console.log(`Source:   ${row.source}`);
      console.log(`When:     ${row.timestamp}`);
      console.log(`Distance: ${row.distance.toFixed(4)}`);
      console.log(`Content:  ${row.content}`);
    });

    console.log('\n✅ Demo complete. This is the semantic grouping behavior your PKE will use.\n');
  } catch (error) {
    console.error('\n❌ Knowledge demo failed:', error.message || error);
  }
}

runDemo();


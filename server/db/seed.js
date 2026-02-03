import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from './config.js';

dotenv.config();

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  console.log('\n🌱 OFA Database Seeding\n');
  console.log('================================\n');

  try {
    // Create sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const userResult = await query(
      `INSERT INTO users (name, email, password, onboarding_completed, onboarding_step, vision, current_goal, reminder_time, review_day, tone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET name = $1
       RETURNING id`,
      [
        'Demo User',
        'demo@ofa.app',
        hashedPassword,
        true,
        7,
        'A focused builder who creates meaningful products while maintaining deep relationships and excellent health.',
        'Complete my most important task before checking email each day',
        '09:00',
        'sunday',
        'coach'
      ]
    );

    const userId = userResult.rows[0].id;
    console.log(`✅ Created demo user: demo@ofa.app`);

    // Add values
    const values = ['growth', 'mastery', 'health', 'impact'];
    for (const value of values) {
      await query(
        `INSERT INTO user_values (user_id, value) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, value]
      );
    }
    console.log(`✅ Added ${values.length} values`);

    // Add roles
    const roles = ['founder', 'creator'];
    for (const role of roles) {
      await query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, role]
      );
    }
    console.log(`✅ Added ${roles.length} roles`);

    // Add focus areas
    const focusAreas = ['time', 'consistency', 'direction'];
    for (const area of focusAreas) {
      await query(
        `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, area]
      );
    }
    console.log(`✅ Added ${focusAreas.length} focus areas`);

    // Add sample goals
    await query(
      `INSERT INTO goals (user_id, title, value_tag, status, priority)
       VALUES 
         ($1, 'Launch MVP by end of month', 'impact', 'active', 1),
         ($1, 'Exercise 3x per week', 'health', 'active', 2),
         ($1, 'Read 30 minutes daily', 'growth', 'active', 3)
       ON CONFLICT DO NOTHING`,
      [userId]
    );
    console.log(`✅ Added sample goals`);

    // Add sample journal entry
    await query(
      `INSERT INTO journal_entries (user_id, content, mood, energy)
       VALUES ($1, 'Starting my journey with OFA. Feeling motivated to build better systems in my life.', 4, 4)
       ON CONFLICT DO NOTHING`,
      [userId]
    );
    console.log(`✅ Added sample journal entry`);

    console.log('\n================================');
    console.log('✅ Database seeding complete!\n');
    console.log('Demo account credentials:');
    console.log('  Email:    demo@ofa.app');
    console.log('  Password: password123\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
















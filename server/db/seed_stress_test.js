import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from './config.js';

dotenv.config();

/**
 * Stress Test Seed Script
 * Creates hundreds of entries across ALL features for testing
 * User: vnair0795@gmail.com / Cherry@123
 */

const USER_EMAIL = 'vnair0795@gmail.com';
const USER_PASSWORD = 'Cherry@123';
const USER_NAME = 'Vishnu Nair';

// Generate random data helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};
const randomDateTime = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 20), randomInt(0, 59), 0);
  return date.toISOString();
};

// Data arrays
const incomeSources = ['Salary', 'Freelance', 'Consulting', 'Investment', 'Side Project', 'Rental', 'Dividends', 'Bonus'];
const companies = ['Tech Corp', 'Startup Inc', 'Freelance Client', 'Investment Fund', 'Real Estate Co', null];
const frequencies = ['weekly', 'biweekly', 'monthly', 'yearly', 'one-time'];
const expenseCategories = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Travel', 'Subscriptions', 'Other'];
const expenseDescriptions = ['Groceries', 'Restaurant', 'Uber', 'Netflix', 'Gym', 'Books', 'Flight', 'Coffee', 'Clothes', 'Phone Bill', 'Internet', 'Utilities'];
const projectNames = ['Website Redesign', 'Mobile App', 'Marketing Campaign', 'Product Launch', 'Content Strategy', 'Brand Identity', 'E-commerce Platform', 'Analytics Dashboard', 'API Development', 'Data Migration'];
const taskTitles = ['Research', 'Design', 'Develop', 'Test', 'Review', 'Deploy', 'Document', 'Optimize', 'Refactor', 'Debug', 'Plan', 'Execute'];
const moods = ['happy', 'sad', 'anxious', 'excited', 'calm', 'frustrated', 'grateful', 'overwhelmed', 'focused', 'tired', 'energetic', 'peaceful'];
const listNames = ['Shopping', 'Books to Read', 'Movies to Watch', 'Places to Visit', 'Ideas', 'Goals', 'Recipes', 'Workout Plan', 'Learning Resources'];
const calendarTypes = ['event', 'task', 'note', 'reminder'];
const calendarTitles = ['Team Meeting', 'Client Call', 'Project Review', 'Lunch', 'Gym Session', 'Doctor Appointment', 'Birthday', 'Conference', 'Workshop', 'Interview'];

async function seedStressTest() {
  console.log('\n🚀 Stress Test Seed Script');
  console.log('==========================\n');
  console.log(`Target: ${USER_EMAIL}`);
  console.log(`Creating HUNDREDS of entries across all features...\n`);

  try {
    // Step 1: Create or get user
    console.log('👤 Creating/finding user...');
    let userResult = await query('SELECT id FROM users WHERE email = $1', [USER_EMAIL.toLowerCase()]);
    
    let userId;
    if (userResult.rows.length === 0) {
      // Create user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(USER_PASSWORD, salt);
      
      const newUser = await query(
        `INSERT INTO users (name, email, password, onboarding_completed)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [USER_NAME, USER_EMAIL.toLowerCase(), hashedPassword]
      );
      userId = newUser.rows[0].id;
      console.log(`✅ Created user: ${userId}`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`✅ Found existing user: ${userId}`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    const tables = [
      'knowledge_events', 'project_tasks', 'project_notes', 'project_milestones', 
      'project_phases', 'project_tags', 'projects', 'expenses', 'income_streams', 
      'subscriptions', 'daily_intentions', 'thinking_space_entries', 'tasks', 
      'calendar_events', 'list_items', 'lists', 'resources'
    ];
    
    for (const table of tables) {
      try {
        if (table === 'project_notes' || table === 'project_milestones' || table === 'project_phases' || table === 'project_tags') {
          await query(`DELETE FROM ${table} WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)`, [userId]);
        } else if (table === 'project_tasks') {
          await query(`DELETE FROM ${table} WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)`, [userId]);
        } else {
          await query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
        }
      } catch (e) {
        // Table might not exist, continue
      }
    }
    console.log('✅ Cleared existing data\n');

    // ============================================
    // 1. MONEY: 300+ entries
    // ============================================
    console.log('💰 Creating 300+ money entries...');
    
    // 50 Income streams
    for (let i = 0; i < 50; i++) {
      await query(
        `INSERT INTO income_streams (user_id, source, amount, frequency, company)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          randomItem(incomeSources),
          randomFloat(500, 10000),
          randomItem(frequencies),
          randomItem(companies)
        ]
      );
    }
    console.log('  ✅ 50 income streams');

    // 200 Expenses
    for (let i = 0; i < 200; i++) {
      await query(
        `INSERT INTO expenses (user_id, amount, category, description, note, expense_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          randomFloat(5, 500),
          randomItem(expenseCategories),
          randomItem(expenseDescriptions),
          i % 10 === 0 ? `Note for expense ${i}` : null,
          randomDate(randomInt(0, 365))
        ]
      );
    }
    console.log('  ✅ 200 expenses');

    // 50 Subscriptions
    for (let i = 0; i < 50; i++) {
      await query(
        `INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          `Subscription ${i + 1}`,
          randomFloat(5, 50),
          randomItem(['monthly', 'yearly']),
          randomDate(randomInt(0, 30)),
          randomItem(['active', 'cancelled'])
        ]
      );
    }
    console.log('  ✅ 50 subscriptions');

    // ============================================
    // 2. PROJECTS: 20 projects with 500+ tasks
    // ============================================
    console.log('\n🚀 Creating 20 projects with 500+ tasks...');
    
    const projectIds = [];
    for (let i = 0; i < 20; i++) {
      const project = await query(
        `INSERT INTO projects (user_id, name, description, progress, start_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          userId,
          `${randomItem(projectNames)} ${i + 1}`,
          `Description for project ${i + 1}`,
          randomInt(0, 100),
          randomDate(randomInt(0, 180))
        ]
      );
      projectIds.push(project.rows[0].id);
    }
    console.log('  ✅ 20 projects created');

    // 500 Project tasks
    for (let i = 0; i < 500; i++) {
      await query(
        `INSERT INTO project_tasks (project_id, user_id, title, description, status, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          randomItem(projectIds),
          userId,
          `${randomItem(taskTitles)} Task ${i + 1}`,
          i % 20 === 0 ? `Task description ${i + 1}` : null,
          randomItem(['todo', 'in_progress', 'done']),
          randomItem(['low', 'medium', 'high']),
          randomDate(randomInt(0, 90))
        ]
      );
    }
    console.log('  ✅ 500 project tasks');

    // 100 Project notes
    for (let i = 0; i < 100; i++) {
      await query(
        `INSERT INTO project_notes (project_id, user_id, content)
         VALUES ($1, $2, $3)`,
        [
          randomItem(projectIds),
          userId,
          `Project note ${i + 1}: This is a detailed note about the project progress and insights.`
        ]
      );
    }
    console.log('  ✅ 100 project notes');

    // 50 Milestones
    for (let i = 0; i < 50; i++) {
      await query(
        `INSERT INTO project_milestones (project_id, name, description, milestone_date)
         VALUES ($1, $2, $3, $4)`,
        [
          randomItem(projectIds),
          `Milestone ${i + 1}`,
          `Milestone description`,
          randomDate(randomInt(0, 180))
        ]
      );
    }
    console.log('  ✅ 50 milestones');

    // ============================================
    // 3. DASHBOARD: 200+ entries
    // ============================================
    console.log('\n📝 Creating 200+ dashboard entries...');

    // 100 Daily intentions
    for (let i = 0; i < 100; i++) {
      await query(
        `INSERT INTO daily_intentions (user_id, intention, entry_date)
         VALUES ($1, $2, $3)`,
        [
          userId,
          `Intention ${i + 1}: ${randomItem(['Focus on work', 'Exercise', 'Read', 'Meditate', 'Call family', 'Plan week'])}`,
          randomDate(randomInt(0, 100))
        ]
      );
    }
    console.log('  ✅ 100 daily intentions');

    // 100 Thinking space entries
    for (let i = 0; i < 100; i++) {
      await query(
        `INSERT INTO thinking_space_entries (user_id, content, mode, entry_date)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          `Thinking space entry ${i + 1}: This is a reflection on my day and thoughts about the future.`,
          randomItem(['freewrite', 'stuck', 'decision']),
          randomDate(randomInt(0, 100))
        ]
      );
    }
    console.log('  ✅ 100 thinking space entries');

    // ============================================
    // 4. CALENDAR: 300+ events
    // ============================================
    console.log('\n📅 Creating 300+ calendar events...');

    for (let i = 0; i < 300; i++) {
      const startTime = randomDateTime(randomInt(0, 90));
      const endDate = new Date(startTime);
      endDate.setHours(endDate.getHours() + randomInt(1, 4));
      
      await query(
        `INSERT INTO calendar_events (user_id, title, description, type, start_time, end_time, all_day)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          `${randomItem(calendarTitles)} ${i + 1}`,
          i % 10 === 0 ? `Event description ${i + 1}` : null,
          randomItem(calendarTypes),
          startTime,
          endDate.toISOString(),
          i % 5 === 0
        ]
      );
    }
    console.log('  ✅ 300 calendar events');

    // ============================================
    // 5. TASKS: 200+ tasks
    // ============================================
    console.log('\n✅ Creating 200+ tasks...');

    for (let i = 0; i < 200; i++) {
      await query(
        `INSERT INTO tasks (user_id, title, description, due_date, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          `${randomItem(taskTitles)} Task ${i + 1}`,
          i % 15 === 0 ? `Task description ${i + 1}` : null,
          randomDate(randomInt(0, 60)),
          randomItem(['pending', 'in_progress', 'completed'])
        ]
      );
    }
    console.log('  ✅ 200 tasks');

    // ============================================
    // 6. LISTS: 20 lists with 200+ items
    // ============================================
    console.log('\n📋 Creating 20 lists with 200+ items...');

    const listIds = [];
    for (let i = 0; i < 20; i++) {
      const list = await query(
        `INSERT INTO lists (user_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          userId,
          `${randomItem(listNames)} ${i + 1}`,
          `List description ${i + 1}`
        ]
      );
      listIds.push(list.rows[0].id);
    }
    console.log('  ✅ 20 lists created');

    // 200 List items
    for (let i = 0; i < 200; i++) {
      await query(
        `INSERT INTO list_items (list_id, title, note, tag, is_done, position)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          randomItem(listIds),
          `List item ${i + 1}`,
          i % 10 === 0 ? `Note for item ${i + 1}` : null,
          i % 5 === 0 ? randomItem(['urgent', 'important', 'someday']) : null,
          i % 3 === 0,
          i + 1
        ]
      );
    }
    console.log('  ✅ 200 list items');

    // ============================================
    // 7. LIBRARY: 100+ resources
    // ============================================
    console.log('\n📚 Creating 100+ library resources...');

    const resourceTitles = ['How to Build Better Habits', 'The Art of Productivity', 'Design Systems Guide', 'JavaScript Best Practices', 'Product Management 101'];
    const categories = ['Uncategorized', 'Productivity', 'Design', 'Development', 'Business', 'Learning', 'Health', 'Finance'];

    for (let i = 0; i < 100; i++) {
      await query(
        `INSERT INTO resources (user_id, title, file_url, file_name, file_size, category, notes, author, priority, progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          `${randomItem(resourceTitles)} ${i + 1}`,
          `https://example.com/resource-${i + 1}.pdf`,
          `resource-${i + 1}.pdf`,
          randomInt(1000000, 10000000), // 1MB to 10MB
          randomItem(categories),
          i % 10 === 0 ? `Notes for resource ${i + 1}` : null,
          i % 5 === 0 ? `Author ${i + 1}` : null,
          randomItem(['low', 'normal', 'high']),
          randomFloat(0, 100)
        ]
      );
    }
    console.log('  ✅ 100 library resources');

    // ============================================
    // 8. EMOTIONS/UNLOAD: 150+ entries
    // ============================================
    console.log('\n💭 Creating 150+ emotion entries...');

    // Note: Using unload_entries table if it exists
    for (let i = 0; i < 150; i++) {
      try {
        await query(
          `INSERT INTO unload_entries (user_id, type, content, transcript, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            randomItem(['text', 'voice']),
            `Emotion entry ${i + 1}: Feeling ${randomItem(moods)} today. ${randomItem(['Had a good day', 'Struggling with work', 'Excited about upcoming project', 'Need to take a break', 'Feeling motivated'])}.`,
            `Transcribed: Emotion entry ${i + 1} with processed text.`,
            randomDateTime(randomInt(0, 90))
          ]
        );
      } catch (e) {
        // Table might not exist, create knowledge events instead
        try {
          await query(
            `INSERT INTO knowledge_events (user_id, source, event_type, content, timestamp, mood)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              'emotions:dump',
              'create',
              `Emotion entry ${i + 1}: Feeling ${randomItem(moods)}`,
              randomDateTime(randomInt(0, 90)),
              randomItem(moods)
            ]
          );
        } catch (e2) {
          // Skip if table doesn't exist
        }
      }
    }
    console.log('  ✅ 150 emotion entries');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n===========================================');
    console.log('✅ STRESS TEST SEEDING COMPLETE!');
    console.log('===========================================\n');
    console.log('Created for:', USER_EMAIL);
    console.log('\n📊 Summary:');
    console.log('  💰 300+ money entries (50 income, 200 expenses, 50 subscriptions)');
    console.log('  🚀 20 projects with 650+ items (500 tasks, 100 notes, 50 milestones)');
    console.log('  📝 200+ dashboard entries (100 intentions, 100 thinking space)');
    console.log('  📅 300 calendar events');
    console.log('  ✅ 200 tasks');
    console.log('  📋 20 lists with 200 items');
    console.log('  📚 100 library resources');
    console.log('  💭 150 emotion entries');
    console.log('\n📈 Total: ~2,000+ entries across all features!');
    console.log('\n🔐 Login credentials:');
    console.log(`  Email: ${USER_EMAIL}`);
    console.log(`  Password: ${USER_PASSWORD}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Stress test seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedStressTest();


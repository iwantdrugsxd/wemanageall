import dotenv from 'dotenv';
import { query } from './config.js';
import { createKnowledgeEvent } from '../services/knowledge.js';

dotenv.config();

/**
 * Comprehensive seed script that populates ALL features for demo user
 * This creates realistic activity across:
 * - Dashboard (intentions, reflections, thinking space)
 * - Money (expenses, income, subscriptions)
 * - Projects (projects, tasks, notes, milestones)
 * - Emotions
 * - Calendar events
 * - Tasks
 * 
 * All of this activity will automatically create knowledge_events
 * through the existing integrations.
 */
async function seedComprehensive() {
  console.log('\n🌱 Comprehensive Activity Seed for Demo User');
  console.log('==========================================\n');

  try {
    // Get demo user
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@ofa.app']
    );

    if (!existing.length) {
      throw new Error('Demo user not found. Run "npm run db:seed" first.');
    }

    const userId = existing[0].id;
    console.log(`✅ Using demo user (id=${userId})`);

    // Clear existing data for clean demo
    console.log('🧹 Clearing existing demo data...');
    await query('DELETE FROM knowledge_events WHERE user_id = $1', [userId]);
    await query('DELETE FROM project_tasks WHERE user_id = $1', [userId]);
    await query('DELETE FROM project_notes WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM project_milestones WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM project_tags WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM projects WHERE user_id = $1', [userId]);
    await query('DELETE FROM expenses WHERE user_id = $1', [userId]);
    await query('DELETE FROM income_streams WHERE user_id = $1', [userId]);
    await query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
    await query('DELETE FROM journal_entries WHERE user_id = $1', [userId]);
    await query('DELETE FROM daily_intentions WHERE user_id = $1', [userId]);
    await query('DELETE FROM thinking_space_entries WHERE user_id = $1', [userId]);
    await query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await query('DELETE FROM calendar_events WHERE user_id = $1', [userId]);
    // Check if emotions table exists and clear it
    try {
      await query('DELETE FROM emotions WHERE user_id = $1', [userId]);
    } catch (e) {
      // Table might not exist, that's okay
    }
    console.log('✅ Cleared existing data');

    const now = new Date();
    const daysAgo = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const formatDate = (date) => date.toISOString().split('T')[0];
    const formatDateTime = (date) => date.toISOString();

    // ============================================
    // 1. DASHBOARD DATA (Last 14 days)
    // ============================================
    console.log('\n📝 Seeding Dashboard data...');

    const dashboardData = [
      // Today
      { date: 0, intentions: ['Focus on project planning', 'Complete morning routine', 'Review weekly goals'], reflection: 'Started the day with clarity. Morning routine helped set the tone. Feeling productive and aligned with my goals.', mood: 'focused' },
      // Yesterday
      { date: 1, intentions: ['Ship MVP features', 'Exercise', 'Call family'], reflection: 'Made good progress on the project. Felt energized after workout. Need to balance work and personal time better.', mood: 'satisfied' },
      // 2 days ago
      { date: 2, intentions: ['Deep work session', 'Meal prep', 'Read for 30 min'], reflection: 'Deep work was interrupted by notifications. Need to set better boundaries. Reading helped me unwind.', mood: 'frustrated' },
      // 3 days ago
      { date: 3, intentions: ['Team meeting', 'Code review', 'Plan next sprint'], reflection: 'Productive team sync. Feeling good about project direction. Excited about upcoming features.', mood: 'excited' },
      // 4 days ago
      { date: 4, intentions: ['Fix bugs', 'Write documentation', 'Test features'], reflection: 'Spent too much time on one bug. Should have asked for help earlier. Learned to time-box debugging.', mood: 'stuck' },
      // 5 days ago
      { date: 5, intentions: ['Design review', 'User research', 'Prototype'], reflection: 'User feedback was eye-opening. Need to pivot slightly. Feeling optimistic about changes.', mood: 'optimistic' },
      // 6 days ago
      { date: 6, intentions: ['Weekly review', 'Plan next week', 'Rest'], reflection: 'Good week overall. Accomplished most goals. Need to prioritize rest more consistently.', mood: 'calm' },
      // 7 days ago
      { date: 7, intentions: ['Launch preparation', 'Marketing materials', 'Beta testing'], reflection: 'Launch day nerves. Everything went smoothly. Grateful for team support.', mood: 'grateful' },
      // 8 days ago
      { date: 8, intentions: ['Customer interviews', 'Feature requests', 'Roadmap planning'], reflection: 'Customer insights were valuable. Realized we need to focus on core features first.', mood: 'insightful' },
      // 9 days ago
      { date: 9, intentions: ['Performance optimization', 'Security audit', 'Backup systems'], reflection: 'Technical debt caught up. Need to allocate more time for maintenance. Feeling responsible.', mood: 'responsible' },
      // 10 days ago
      { date: 10, intentions: ['Content creation', 'Social media', 'Community building'], reflection: 'Content resonated well. Building community takes time but feels rewarding.', mood: 'hopeful' },
      // 11 days ago
      { date: 11, intentions: ['Learn new framework', 'Practice coding', 'Build side project'], reflection: 'Learning curve was steeper than expected. Persistence paid off. Feeling accomplished.', mood: 'accomplished' },
      // 12 days ago
      { date: 12, intentions: ['Networking event', 'Update portfolio', 'Apply for opportunities'], reflection: 'Networking was energizing. Met interesting people. Need to follow up.', mood: 'energized' },
      // 13 days ago
      { date: 13, intentions: ['Meditation', 'Journaling', 'Nature walk'], reflection: 'Took a mental health day. Felt refreshed and reconnected with purpose. Important to prioritize wellbeing.', mood: 'peaceful' },
    ];

    for (const day of dashboardData) {
      const date = formatDate(daysAgo(day.date));

      // Insert intentions
      for (const intention of day.intentions) {
        await query(
          `INSERT INTO daily_intentions (user_id, intention, entry_date)
           VALUES ($1, $2, $3)`,
          [userId, intention, date]
        );
      }

      // Insert reflection
      if (day.reflection) {
        // Map mood text to integer (1-5) if needed, or use null
        const moodMap = {
          'focused': 4,
          'satisfied': 4,
          'frustrated': 2,
          'excited': 5,
          'stuck': 2,
          'optimistic': 4,
          'calm': 4,
          'grateful': 5,
          'insightful': 4,
          'responsible': 3,
          'hopeful': 4,
          'accomplished': 5,
          'energized': 5,
          'peaceful': 4,
        };
        const moodInt = moodMap[day.mood] || null;

        await query(
          `INSERT INTO journal_entries (user_id, content, mood, entry_date)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, entry_date)
           DO UPDATE SET content = $2, mood = $3, updated_at = CURRENT_TIMESTAMP`,
          [userId, day.reflection, moodInt, date]
        );

        // Create knowledge event for reflection
        await createKnowledgeEvent({
          userId,
          source: 'today:reflection',
          eventType: 'upsert',
          content: `Reflection: ${day.reflection} | Mood: ${day.mood} | Date: ${date}`,
          timestamp: daysAgo(day.date),
          projectId: null,
          mood: day.mood,
          rawMetadata: { entry_date: date },
        });
      }

      // Insert thinking space entries (random days)
      // Skip thinking space entries if mode constraint is strict
      // They can be added manually through the UI
    }

    console.log(`✅ Created ${dashboardData.length} days of dashboard data`);

    // ============================================
    // 2. MONEY DATA
    // ============================================
    console.log('\n💰 Seeding Money data...');

    // Income streams
    const incomeStreams = [
      { source: 'Salary', amount: 65000, frequency: 'monthly' },
      { source: 'Freelance Design', amount: 15000, frequency: 'monthly' },
      { source: 'Side Project', amount: 5000, frequency: 'monthly' },
    ];

    for (const income of incomeStreams) {
      await query(
        `INSERT INTO income_streams (user_id, source, amount, frequency)
         VALUES ($1, $2, $3, $4)`,
        [userId, income.source, income.amount, income.frequency]
      );
    }

    // Subscriptions
    const subscriptions = [
      { name: 'Netflix', amount: 499, cycle: 'monthly', nextBilling: daysAgo(-5), status: 'active' },
      { name: 'Spotify', amount: 179, cycle: 'monthly', nextBilling: daysAgo(-3), status: 'active' },
      { name: 'Notion', amount: 800, cycle: 'monthly', nextBilling: daysAgo(-10), status: 'active' },
      { name: 'Adobe Creative Cloud', amount: 1999, cycle: 'monthly', nextBilling: daysAgo(-7), status: 'active' },
      { name: 'Old Tool (Cancelled)', amount: 299, cycle: 'monthly', nextBilling: daysAgo(10), status: 'cancelled' },
    ];

    for (const sub of subscriptions) {
      await query(
        `INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, sub.name, sub.amount, sub.cycle, formatDate(sub.nextBilling), sub.status]
      );

      if (sub.status === 'cancelled') {
        await createKnowledgeEvent({
          userId,
          source: 'money:subscription',
          eventType: 'update',
          content: `Cancelled subscription: ${sub.name} (₹${sub.amount}/${sub.cycle}). Felt responsible for reducing unnecessary expenses.`,
          timestamp: daysAgo(10),
          mood: 'relieved',
        });
      }
    }

    // Expenses (last 14 days)
    const expenses = [
      { amount: 420, category: 'Food', note: 'Dinner with friends', date: 0, mood: 'happy' },
      { amount: 150, category: 'Travel', note: 'Uber ride', date: 0 },
      { amount: 1200, category: 'Shopping', note: 'Groceries for the week', date: 1 },
      { amount: 350, category: 'Food', note: 'Lunch meeting', date: 1 },
      { amount: 89, category: 'Bills', note: 'Phone bill', date: 2 },
      { amount: 2500, category: 'Shopping', note: 'New headphones', date: 3, mood: 'excited' },
      { amount: 180, category: 'Travel', note: 'Metro card recharge', date: 3 },
      { amount: 450, category: 'Food', note: 'Weekend brunch', date: 4, mood: 'relaxed' },
      { amount: 120, category: 'Health', note: 'Vitamins', date: 5 },
      { amount: 600, category: 'Fun', note: 'Movie tickets', date: 6, mood: 'happy' },
      { amount: 300, category: 'Food', note: 'Coffee shop work session', date: 7 },
      { amount: 2000, category: 'Shopping', note: 'Office supplies', date: 8 },
      { amount: 150, category: 'Travel', note: 'Cab to airport', date: 9 },
      { amount: 800, category: 'Food', note: 'Restaurant celebration', date: 10, mood: 'celebratory' },
      { amount: 500, category: 'Health', note: 'Gym membership', date: 11 },
      { amount: 250, category: 'Food', note: 'Quick lunch', date: 12 },
      { amount: 1200, category: 'Bills', note: 'Electricity bill', date: 13 },
    ];

    for (const expense of expenses) {
      const expenseDate = formatDate(daysAgo(expense.date));
      await query(
        `INSERT INTO expenses (user_id, amount, category, note, expense_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, expense.amount, expense.category, expense.note, expenseDate]
      );

      // Create knowledge event for expense
      await createKnowledgeEvent({
        userId,
        source: 'money:expense',
        eventType: 'create',
        content: `Expense: ₹${expense.amount} for ${expense.category}${expense.note ? ` - ${expense.note}` : ''}`,
        timestamp: daysAgo(expense.date),
        mood: expense.mood || null,
      });
    }

    console.log(`✅ Created ${incomeStreams.length} income streams, ${subscriptions.length} subscriptions, ${expenses.length} expenses`);

    // ============================================
    // 3. PROJECTS DATA
    // ============================================
    console.log('\n🚀 Seeding Projects data...');

    // Create projects
    const projectsData = [
      {
        name: 'Life OS Platform',
        description: 'Building a comprehensive personal life operating system',
        color: '#9333EA',
        icon: '🚀',
        isFavorite: true,
        startDate: daysAgo(30),
      },
      {
        name: 'Mobile App Redesign',
        description: 'Redesigning the mobile experience for better UX',
        color: '#3B82F6',
        icon: '📱',
        isFavorite: false,
        startDate: daysAgo(15),
      },
      {
        name: 'Learning React Advanced',
        description: 'Deep dive into React patterns and performance',
        color: '#10B981',
        icon: '📚',
        isFavorite: true,
        startDate: daysAgo(7),
      },
    ];

    const projectIds = [];
    for (const proj of projectsData) {
      const result = await query(
        `INSERT INTO projects (user_id, name, description, color, icon, is_favorite, start_date, progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [userId, proj.name, proj.description, proj.color, proj.icon, proj.isFavorite, formatDate(proj.startDate), Math.floor(Math.random() * 60) + 20]
      );
      projectIds.push(result.rows[0].id);

      // Add tags
      const tags = proj.name === 'Life OS Platform' ? ['product', 'tech', 'personal'] :
                   proj.name === 'Mobile App Redesign' ? ['design', 'ux', 'mobile'] :
                   ['learning', 'development'];
      for (const tag of tags) {
        await query(
          `INSERT INTO project_tags (project_id, tag)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [result.rows[0].id, tag]
        );
      }
    }

    console.log(`✅ Created ${projectIds.length} projects`);

    // Create tasks for projects
    const tasksData = [
      // Life OS Platform tasks
      { projectIdx: 0, title: 'Design dashboard layout', status: 'done', priority: 'high', dueDate: 5, completedDate: 3 },
      { projectIdx: 0, title: 'Implement authentication', status: 'done', priority: 'high', dueDate: 8, completedDate: 6 },
      { projectIdx: 0, title: 'Build projects workspace', status: 'in_progress', priority: 'high', dueDate: 2 },
      { projectIdx: 0, title: 'Add knowledge engine', status: 'in_progress', priority: 'medium', dueDate: 0 },
      { projectIdx: 0, title: 'Write documentation', status: 'todo', priority: 'medium', dueDate: -3 },
      { projectIdx: 0, title: 'User testing', status: 'todo', priority: 'low', dueDate: -7 },
      // Mobile App Redesign tasks
      { projectIdx: 1, title: 'Research user pain points', status: 'done', priority: 'high', dueDate: 12, completedDate: 10 },
      { projectIdx: 1, title: 'Create wireframes', status: 'in_progress', priority: 'high', dueDate: 5 },
      { projectIdx: 1, title: 'Design system update', status: 'todo', priority: 'medium', dueDate: 0 },
      // Learning React tasks
      { projectIdx: 2, title: 'Study hooks patterns', status: 'done', priority: 'medium', dueDate: 7, completedDate: 5 },
      { projectIdx: 2, title: 'Practice performance optimization', status: 'in_progress', priority: 'medium', dueDate: 2 },
      { projectIdx: 2, title: 'Build sample project', status: 'todo', priority: 'low', dueDate: -5 },
    ];

    for (const task of tasksData) {
      const projectId = projectIds[task.projectIdx];
      const dueDate = task.dueDate >= 0 ? formatDate(daysAgo(task.dueDate)) : null;
      const completedDate = task.completedDate ? daysAgo(task.completedDate) : null;

      await query(
        `INSERT INTO project_tasks (project_id, user_id, title, status, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [projectId, userId, task.title, task.status, task.priority, dueDate]
      );

      // Create knowledge events for task activities
      if (task.status === 'done' && completedDate) {
        await createKnowledgeEvent({
          userId,
          source: 'projects:task_completed',
          eventType: 'create',
          content: `Completed task: ${task.title} for project. Felt accomplished and productive.`,
          timestamp: completedDate,
          projectId,
          mood: 'satisfied',
        });
      } else if (task.status === 'in_progress') {
        await createKnowledgeEvent({
          userId,
          source: 'projects:task_started',
          eventType: 'create',
          content: `Started working on: ${task.title}. Making steady progress.`,
          timestamp: daysAgo(Math.max(0, task.dueDate - 2)),
          projectId,
          mood: 'focused',
        });
      }
    }

    console.log(`✅ Created ${tasksData.length} project tasks`);

    // Create project notes
    const notesData = [
      { projectIdx: 0, content: 'Key insight: Users want simplicity over features. Focus on core experience.', date: 8 },
      { projectIdx: 0, content: 'Technical decision: Use PostgreSQL for structured data, pgvector for semantic search.', date: 5 },
      { projectIdx: 1, content: 'User feedback: Navigation feels cluttered. Need to simplify.', date: 10 },
      { projectIdx: 2, content: 'Learning: useMemo and useCallback are powerful but should be used judiciously.', date: 6 },
    ];

    for (const note of notesData) {
      await query(
        `INSERT INTO project_notes (project_id, user_id, content)
         VALUES ($1, $2, $3)`,
        [projectIds[note.projectIdx], userId, note.content]
      );
    }

    console.log(`✅ Created ${notesData.length} project notes`);

    // ============================================
    // 4. EMOTIONS DATA
    // ============================================
    console.log('\n💭 Seeding Emotions data...');

    const emotionsData = [
      { content: 'Feeling overwhelmed with too many projects. Need to focus.', intensity: 4, date: 2, mood: 'overwhelmed' },
      { content: 'Grateful for the progress made this week. Small wins matter.', intensity: 5, date: 6, mood: 'grateful' },
      { content: 'Excited about the new feature launch. Can\'t wait to see user reactions.', intensity: 5, date: 7, mood: 'excited' },
      { content: 'Frustrated with a bug that took too long to fix. Need better debugging process.', intensity: 3, date: 4, mood: 'frustrated' },
      { content: 'Feeling calm and centered after meditation session. Should do this more often.', intensity: 4, date: 13, mood: 'calm' },
    ];

    // Skip emotions table (uses Supabase/unload_entries, not direct PostgreSQL)
    // We'll create knowledge events directly instead
    console.log('⚠️  Skipping emotions table (uses Supabase), creating knowledge events directly');
    for (const emotion of emotionsData) {
      await createKnowledgeEvent({
        userId,
        source: 'emotions:dump',
        eventType: 'create',
        content: `Emotion entry: ${emotion.content}`,
        timestamp: daysAgo(emotion.date),
        mood: emotion.mood,
      });
    }

    console.log(`✅ Created ${emotionsData.length} emotion entries`);

    // ============================================
    // 5. CALENDAR EVENTS
    // ============================================
    console.log('\n📅 Seeding Calendar data...');

    const calendarEvents = [
      { title: 'Team Standup', type: 'event', date: 0, start: '09:00', end: '09:30' },
      { title: 'Code Review', type: 'event', date: 0, start: '14:00', end: '15:00' },
      { title: 'Gym Session', type: 'event', date: 1, start: '18:00', end: '19:00' },
      { title: 'Client Call', type: 'event', date: 2, start: '11:00', end: '12:00' },
      { title: 'Lunch with Team', type: 'event', date: 3, start: '13:00', end: '14:00' },
      { title: 'Product Demo', type: 'event', date: 4, start: '15:00', end: '16:00' },
      { title: 'Weekend Planning', type: 'event', date: 6, start: '10:00', end: '11:00' },
    ];

    for (const event of calendarEvents) {
      const eventDate = daysAgo(event.date);
      const [startHours, startMins] = event.start.split(':').map(Number);
      const [endHours, endMins] = event.end.split(':').map(Number);
      eventDate.setHours(startHours, startMins, 0, 0);
      const endDate = new Date(eventDate);
      endDate.setHours(endHours, endMins, 0, 0);

      await query(
        `INSERT INTO calendar_events (user_id, title, type, start_time, end_time, color)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, event.title, event.type, formatDateTime(eventDate), formatDateTime(endDate), '#3B6E5C']
      );
    }

    console.log(`✅ Created ${calendarEvents.length} calendar events`);

    // ============================================
    // 6. DAILY TASKS
    // ============================================
    console.log('\n✅ Seeding Tasks data...');

    const tasks = [
      { title: 'Review project roadmap', dueDate: 0, status: 'completed' },
      { title: 'Update documentation', dueDate: 1, status: 'completed' },
      { title: 'Team sync meeting', dueDate: 2, status: 'completed' },
      { title: 'Fix critical bug', dueDate: 3, status: 'pending' },
      { title: 'Write blog post', dueDate: 4, status: 'pending' },
    ];

    for (const task of tasks) {
      await query(
        `INSERT INTO tasks (user_id, title, due_date, status)
         VALUES ($1, $2, $3, $4)`,
        [userId, task.title, formatDate(daysAgo(task.dueDate)), task.status]
      );
    }

    console.log(`✅ Created ${tasks.length} daily tasks`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n===========================================');
    console.log('✅ Comprehensive seeding complete!');
    console.log('===========================================\n');
    console.log('Created:');
    console.log(`  📝 ${dashboardData.length} days of dashboard data`);
    console.log(`  💰 ${incomeStreams.length} income streams, ${subscriptions.length} subscriptions, ${expenses.length} expenses`);
    console.log(`  🚀 ${projectIds.length} projects, ${tasksData.length} tasks, ${notesData.length} notes`);
    console.log(`  💭 ${emotionsData.length} emotion entries`);
    console.log(`  📅 ${calendarEvents.length} calendar events`);
    console.log(`  ✅ ${tasks.length} daily tasks`);
    console.log('\nNext steps:');
    console.log('  1. Run: npm run knowledge:embed (to create embeddings)');
    console.log('  2. Run: npm run knowledge:demo (to see semantic similarity)');
    console.log('  3. Log in as demo@ofa.app to see all the activity!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Comprehensive seeding failed:', error.message || error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedComprehensive();


import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from './config.js';

dotenv.config();

/**
 * Seed comprehensive data for a specific user account
 * Creates the account if it doesn't exist, then populates: Projects, Tasks, Calendar Events, Resources, Lists, Daily Intentions
 * 
 * Usage:
 *   USER_EMAIL=vnair0795@gmail.com USER_PASSWORD=yourpassword USER_NAME="Your Name" node server/db/seed_user_data.js
 */
async function seedUserData() {
  console.log('\n🌱 Creating User Account & Seeding Data\n');
  console.log('================================\n');

  const userEmail = process.env.USER_EMAIL || 'vnair0795@gmail.com';
  const userPassword = process.env.USER_PASSWORD || 'Demo123456';
  const userName = process.env.USER_NAME || 'Demo User';
  
  try {
    // Check if user exists
    let { rows: users } = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [userEmail.toLowerCase()]
    );

    let userId;
    if (!users.length) {
      // Create new user account
      console.log(`📝 Creating new user account: ${userEmail}`);
      const hashedPassword = await bcrypt.hash(userPassword, 12);
      
      const userResult = await query(
        `INSERT INTO users (name, email, password, onboarding_completed, onboarding_step)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          userName,
          userEmail.toLowerCase(),
          hashedPassword,
          true,
          7
        ]
      );
      
      userId = userResult.rows[0].id;
      console.log(`✅ Created user account: ${userEmail} (id=${userId})\n`);
    } else {
      userId = users[0].id;
      // Update password to ensure we know it
      const hashedPassword = await bcrypt.hash(userPassword, 12);
      await query(
        `UPDATE users SET password = $1, name = $2 WHERE id = $3`,
        [hashedPassword, userName, userId]
      );
      console.log(`✅ Found existing user: ${userEmail} (id=${userId})`);
      console.log(`✅ Password updated to: ${userPassword}\n`);
    }

    // Clear existing data for clean seed
    console.log('🧹 Clearing existing data...');
    await query('DELETE FROM project_tasks WHERE user_id = $1', [userId]);
    await query('DELETE FROM project_phases WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM project_milestones WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM project_tags WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM project_notes WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)', [userId]);
    await query('DELETE FROM projects WHERE user_id = $1', [userId]);
    await query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await query('DELETE FROM events WHERE user_id = $1', [userId]);
    await query('DELETE FROM calendar_events WHERE user_id = $1', [userId]);
    await query('DELETE FROM resources WHERE user_id = $1', [userId]);
    await query('DELETE FROM list_items WHERE list_id IN (SELECT id FROM lists WHERE user_id = $1)', [userId]);
    await query('DELETE FROM lists WHERE user_id = $1', [userId]);
    await query('DELETE FROM daily_intentions WHERE user_id = $1', [userId]);
    console.log('✅ Cleared existing data\n');

    const now = new Date();
    const daysAgo = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };
    const daysFromNow = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return d;
    };

    const formatDate = (date) => {
      // Ensure we're working with a Date object
      const d = date instanceof Date ? date : new Date(date);
      // Return YYYY-MM-DD format
      return d.toISOString().split('T')[0];
    };
    const formatDateTime = (date) => {
      const d = date instanceof Date ? date : new Date(date);
      return d.toISOString();
    };

    // ============================================
    // 1. PROJECTS WITH TASKS
    // ============================================
    console.log('🚀 Creating Projects...');

    const projectsData = [
      {
        name: 'Q1 Product Launch',
        description: 'Launch new product features and marketing campaign for Q1',
        color: '#9333EA',
        icon: '🚀',
        startDate: daysAgo(45),
        progress: 65,
        tags: ['Product', 'Marketing'],
        phases: [
          {
            name: 'Planning',
            order: 0,
            tasks: [
              { title: 'Market research and competitor analysis', status: 'done', priority: 'high', dueDate: daysAgo(40) },
              { title: 'Define product requirements', status: 'done', priority: 'high', dueDate: daysAgo(35) },
              { title: 'Create project timeline', status: 'done', priority: 'medium', dueDate: daysAgo(30) },
            ]
          },
          {
            name: 'Development',
            order: 1,
            tasks: [
              { title: 'Design mockups and wireframes', status: 'done', priority: 'high', dueDate: daysAgo(25) },
              { title: 'API integration', status: 'in_progress', priority: 'high', dueDate: daysAgo(2) },
              { title: 'Frontend implementation', status: 'in_progress', priority: 'high', dueDate: daysFromNow(5) },
              { title: 'Backend development', status: 'in_progress', priority: 'high', dueDate: daysFromNow(7) },
              { title: 'Testing and QA', status: 'todo', priority: 'medium', dueDate: daysFromNow(15) },
            ]
          },
          {
            name: 'Launch',
            order: 2,
            tasks: [
              { title: 'Marketing materials', status: 'todo', priority: 'medium', dueDate: daysFromNow(20) },
              { title: 'Beta testing', status: 'todo', priority: 'high', dueDate: daysFromNow(25) },
              { title: 'Production deployment', status: 'todo', priority: 'high', dueDate: daysFromNow(30) },
            ]
          }
        ]
      },
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        color: '#3B82F6',
        icon: '🎨',
        startDate: daysAgo(20),
        progress: 35,
        tags: ['Design', 'Frontend'],
        phases: [
          {
            name: 'Design',
            order: 0,
            tasks: [
              { title: 'User research and interviews', status: 'done', priority: 'high', dueDate: daysAgo(18) },
              { title: 'Create design system', status: 'in_progress', priority: 'high', dueDate: daysFromNow(3) },
              { title: 'Design homepage', status: 'todo', priority: 'high', dueDate: daysFromNow(10) },
            ]
          },
          {
            name: 'Development',
            order: 1,
            tasks: [
              { title: 'Set up development environment', status: 'todo', priority: 'medium', dueDate: daysFromNow(12) },
              { title: 'Implement responsive layouts', status: 'todo', priority: 'high', dueDate: daysFromNow(18) },
            ]
          }
        ]
      },
      {
        name: 'Mobile App Development',
        description: 'Build native mobile app for iOS and Android',
        color: '#10B981',
        icon: '📱',
        startDate: daysAgo(10),
        progress: 20,
        tags: ['Mobile', 'Engineering'],
        phases: [
          {
            name: 'Setup',
            order: 0,
            tasks: [
              { title: 'Project setup', status: 'done', priority: 'high', dueDate: daysAgo(8) },
              { title: 'Architecture planning', status: 'in_progress', priority: 'high', dueDate: daysFromNow(2) },
            ]
          }
        ]
      }
    ];

    const projectIds = [];
    for (const proj of projectsData) {
      // Create project
      const projectResult = await query(
        `INSERT INTO projects (user_id, name, description, color, icon, start_date, progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userId, proj.name, proj.description, proj.color, proj.icon, formatDate(proj.startDate), proj.progress]
      );
      const projectId = projectResult.rows[0].id;
      projectIds.push(projectId);

      // Add tags
      for (const tag of proj.tags) {
        await query(
          `INSERT INTO project_tags (project_id, tag)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [projectId, tag]
        );
      }

      // Create phases and tasks
      for (const phase of proj.phases) {
        const phaseResult = await query(
          `INSERT INTO project_phases (project_id, name, order_index)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [projectId, phase.name, phase.order]
        );
        const phaseId = phaseResult.rows[0].id;

        for (const task of phase.tasks) {
          await query(
            `INSERT INTO project_tasks (project_id, user_id, title, status, priority, due_date, phase_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              projectId,
              userId,
              task.title,
              task.status,
              task.priority,
              task.dueDate ? formatDate(task.dueDate) : null,
              phaseId
            ]
          );
        }
      }

      console.log(`   ✅ Created project: ${proj.name}`);
    }

    console.log(`✅ Created ${projectIds.length} projects with tasks\n`);

    // ============================================
    // 2. CALENDAR EVENTS
    // ============================================
    console.log('📅 Creating Calendar Events...');

    // Initialize both events tables if they don't exist
    try {
      // New events table
      await query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          start_at TIMESTAMP WITH TIME ZONE NOT NULL,
          end_at TIMESTAMP WITH TIME ZONE NOT NULL,
          all_day BOOLEAN DEFAULT false,
          type VARCHAR(30) DEFAULT 'event' CHECK (type IN ('event', 'meeting', 'task', 'milestone')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await query(`CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start_at)`);
      
      // Old calendar_events table (for /api/today endpoint)
      await query(`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE,
          all_day BOOLEAN DEFAULT FALSE,
          type VARCHAR(50) DEFAULT 'event',
          color VARCHAR(7),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time)`);
    } catch (e) {
      // Table might already exist, that's fine
    }

    const today = new Date();
    const events = [
      {
        title: 'Team Standup',
        description: 'Daily team sync and progress update',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
        type: 'event',
        color: '#3B6E5C'
      },
      {
        title: 'Deep Work Session',
        description: 'Focused coding time - no meetings',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        type: 'task',
        color: '#4A90E2'
      },
      {
        title: 'Client Call',
        description: 'Quarterly review with main client',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        type: 'event',
        color: '#F5A623'
      },
      {
        title: 'Product Review Meeting',
        description: 'Review Q1 launch progress',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
        type: 'event',
        color: '#3B6E5C'
      },
      {
        title: 'Design Review',
        description: 'Review website redesign mockups',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 30),
        type: 'event',
        color: '#3B82F6'
      }
    ];

    let eventsCreated = 0;
    for (const event of events) {
      try {
        // Insert into new events table
        await query(
          `INSERT INTO events (user_id, title, description, start_at, end_at, type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            event.title,
            event.description,
            formatDateTime(event.start),
            formatDateTime(event.end),
            event.type
          ]
        );
        
        // Also insert into calendar_events table for /api/today endpoint
        await query(
          `INSERT INTO calendar_events (user_id, title, description, start_time, end_time, type, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            event.title,
            event.description,
            formatDateTime(event.start),
            formatDateTime(event.end),
            event.type,
            event.color || '#3B6E5C'
          ]
        );
        
        eventsCreated++;
      } catch (e) {
        console.error(`   ⚠️  Failed to insert event: ${event.title}`, e.message);
      }
    }

    console.log(`✅ Created ${eventsCreated} calendar events\n`);

    // ============================================
    // 3. RESOURCES
    // ============================================
    console.log('📚 Creating Resources...');

    const resources = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Programming',
        folder: 'Books',
        priority: 'high',
        notes: 'Essential reading for writing maintainable code. Focus on chapters 1-5.',
        progress: 33
      },
      {
        title: 'React Patterns: Best Practices for Building Modern Web Apps',
        author: 'Lars Grammel',
        category: 'Programming',
        folder: 'Books',
        priority: 'normal',
        notes: 'Great patterns for component architecture',
        progress: 15
      },
      {
        title: 'Design Systems Handbook',
        author: 'DesignBetter.co',
        category: 'Design',
        folder: 'Articles',
        priority: 'normal',
        notes: 'Building consistent design systems',
        progress: 60
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        category: 'Business',
        folder: 'Books',
        priority: 'high',
        notes: 'MVP and iteration strategies',
        progress: 80
      }
    ];

    for (const resource of resources) {
      await query(
        `INSERT INTO resources (user_id, title, file_url, file_name, category, folder, priority, notes, author, progress, total_pages)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId,
          resource.title,
          '/placeholder.pdf', // Placeholder file URL
          `${resource.title.replace(/\s+/g, '_')}.pdf`, // Placeholder file name
          resource.category,
          resource.folder,
          resource.priority,
          resource.notes,
          resource.author,
          resource.progress,
          100 // Placeholder total pages
        ]
      );
    }

    console.log(`✅ Created ${resources.length} resources\n`);

    // ============================================
    // 4. LISTS
    // ============================================
    console.log('📝 Creating Lists...');

    const lists = [
      {
        name: 'Movies to Watch',
        description: 'Curated list of movies recommended by friends',
        icon: '🎬',
        items: [
          'The Matrix',
          'Inception',
          'Interstellar',
          'Blade Runner 2049',
          'Dune',
          'Everything Everywhere All at Once',
          'Parasite',
          'The Social Network',
          'Her',
          'Ex Machina',
          'Arrival',
          'The Prestige'
        ]
      },
      {
        name: 'Books to Read',
        description: 'Reading list for personal growth',
        icon: '📚',
        items: [
          'Atomic Habits',
          'The 7 Habits of Highly Effective People',
          'Sapiens',
          'Thinking Fast and Slow',
          'The Power of Now',
          'Meditations',
          'The Art of War',
          'Zero to One'
        ]
      },
      {
        name: 'Places to Visit',
        description: 'Travel bucket list',
        icon: '🌍',
        items: [
          'Japan',
          'Iceland',
          'New Zealand',
          'Switzerland',
          'Norway'
        ]
      }
    ];

    for (const list of lists) {
      const listResult = await query(
        `INSERT INTO lists (user_id, name, description, icon)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, list.name, list.description, list.icon]
      );
      const listId = listResult.rows[0].id;

      // Add list items
      for (let i = 0; i < list.items.length; i++) {
        await query(
          `INSERT INTO list_items (list_id, title, position)
           VALUES ($1, $2, $3)`,
          [listId, list.items[i], i + 1]
        );
      }

      console.log(`   ✅ Created list: ${list.name} (${list.items.length} items)`);
    }

    console.log(`✅ Created ${lists.length} lists\n`);

    // ============================================
    // 5. DAILY INTENTIONS & OBJECTIVES
    // ============================================
    console.log('📋 Creating Daily Intentions...');

    const todayIntentions = [
      'Focus on shipping the new feature',
      'Complete API integration for Q1 Launch',
      'Review and merge pending PRs',
      'Team standup at 10 AM',
      'Deep work session in the afternoon'
    ];

    const todayDate = formatDate(now);
    for (const intention of todayIntentions) {
      await query(
        `INSERT INTO daily_intentions (user_id, intention, entry_date)
         VALUES ($1, $2, $3)`,
        [userId, intention, todayDate]
      );
    }

    // Add some past intentions
    for (let i = 1; i <= 7; i++) {
      const date = formatDate(daysAgo(i));
      const pastIntentions = [
        `Complete ${i === 1 ? 'yesterday\'s' : 'previous'} tasks`,
        `Review project progress`,
        `Plan for upcoming week`
      ];
      for (const intention of pastIntentions) {
        await query(
          `INSERT INTO daily_intentions (user_id, intention, entry_date)
           VALUES ($1, $2, $3)`,
          [userId, intention, date]
        );
      }
    }

    console.log(`✅ Created daily intentions\n`);

    // ============================================
    // 6. STANDALONE TASKS (for Today/Dashboard)
    // ============================================
    console.log('✅ Creating Standalone Tasks...');

    // Map priority strings to integers (low=1, medium=2, high=3)
    const priorityMap = { 'low': 1, 'medium': 2, 'high': 3 };
    
    // Create tasks - most should be due today for the dashboard
    const tasks = [
      {
        title: 'Review PR feedback',
        description: 'Review and address feedback on feature branch',
        status: 'todo',
        priority: 'high',
        dueDate: today,
        timeEstimate: 60
      },
      {
        title: 'Update documentation',
        description: 'Update API documentation for new endpoints',
        status: 'todo',
        priority: 'medium',
        dueDate: today,
        timeEstimate: 45
      },
      {
        title: 'Team standup',
        description: 'Daily team sync meeting',
        status: 'todo',
        priority: 'high',
        dueDate: today,
        timeEstimate: 30
      },
      {
        title: 'Complete API integration',
        description: 'Finish API integration for Q1 Launch project',
        status: 'in_progress',
        priority: 'high',
        dueDate: today,
        timeEstimate: 120
      },
      {
        title: 'Code review',
        description: 'Review team member PRs',
        status: 'in_progress',
        priority: 'medium',
        dueDate: daysFromNow(1),
        timeEstimate: 90
      },
      {
        title: 'Write blog post',
        description: 'Write about recent product launch',
        status: 'todo',
        priority: 'low',
        dueDate: daysFromNow(3),
        timeEstimate: 120
      }
    ];

    for (const task of tasks) {
      try {
        const priorityInt = priorityMap[task.priority] || 2; // Default to medium
        // Check if time_estimate column exists, if not, don't include it
        await query(
          `INSERT INTO tasks (user_id, title, description, status, priority, due_date, time_estimate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            task.title,
            task.description,
            task.status,
            priorityInt,
            formatDate(task.dueDate),
            task.timeEstimate
          ]
        );
      } catch (e) {
        // If time_estimate column doesn't exist, insert without it
        try {
          const priorityInt = priorityMap[task.priority] || 2;
          await query(
            `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              task.title,
              task.description,
              task.status,
              priorityInt,
              formatDate(task.dueDate)
            ]
          );
        } catch (e2) {
          console.error(`   ⚠️  Failed to insert task: ${task.title}`, e2.message);
        }
      }
    }

    console.log(`✅ Created ${tasks.length} standalone tasks\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('================================');
    console.log('✅ Seeding Complete!\n');
    console.log(`📊 Summary for ${userEmail}:`);
    console.log(`   • ${projectIds.length} Projects`);
    console.log(`   • ${eventsCreated} Calendar Events`);
    console.log(`   • ${resources.length} Resources`);
    console.log(`   • ${lists.length} Lists`);
    console.log(`   • ${todayIntentions.length} Today's Intentions`);
    console.log(`   • ${tasks.length} Standalone Tasks\n`);
    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: ${userPassword}\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedUserData();

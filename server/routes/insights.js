import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

/**
 * GET /api/insights
 * Get user's insights (for Dashboard widget)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Get insights that haven't been dismissed
    const result = await query(
      `SELECT id, scope, title, body, confidence, created_at, seen_at, dismissed_at, muted, meta
       FROM knowledge_insights
       WHERE user_id = $1
         AND dismissed_at IS NULL
         AND muted = FALSE
       ORDER BY confidence DESC, created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      insights: result.rows,
    });
  } catch (error) {
    console.error('Get insights error:', error);
    // If table doesn't exist, return empty array (graceful degradation)
    if (error.message?.includes('does not exist')) {
      return res.json({ insights: [] });
    }
    res.status(500).json({ error: 'Failed to fetch insights.' });
  }
});

/**
 * POST /api/insights/:id/seen
 * Mark insight as seen
 */
router.post('/:id/seen', requireAuth, async (req, res) => {
  try {
    await query(
      `UPDATE knowledge_insights
       SET seen_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark insight seen error:', error);
    res.status(500).json({ error: 'Failed to mark insight as seen.' });
  }
});

/**
 * POST /api/insights/:id/dismiss
 * Dismiss an insight
 */
router.post('/:id/dismiss', requireAuth, async (req, res) => {
  try {
    await query(
      `UPDATE knowledge_insights
       SET dismissed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Dismiss insight error:', error);
    res.status(500).json({ error: 'Failed to dismiss insight.' });
  }
});

/**
 * POST /api/insights/:id/mute
 * Mute a type of insight
 */
router.post('/:id/mute', requireAuth, async (req, res) => {
  try {
    const { scope } = req.body;
    
    // Mute this specific insight
    await query(
      `UPDATE knowledge_insights
       SET muted = TRUE
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    // Optionally mute all insights of this scope
    if (scope) {
      await query(
        `UPDATE knowledge_insights
         SET muted = TRUE
         WHERE user_id = $1 AND scope = $2 AND dismissed_at IS NULL`,
        [req.user.id, scope]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mute insight error:', error);
    res.status(500).json({ error: 'Failed to mute insight.' });
  }
});

/**
 * POST /api/insights/account-feedback
 * Generate comprehensive AI feedback on user's account
 */
router.post('/account-feedback', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Gather comprehensive account data
    const [
      projectsResult,
      tasksResult,
      expensesResult,
      incomeResult,
      intentionsResult,
      emotionsResult,
      calendarResult,
      listsResult
    ] = await Promise.all([
      query(`SELECT COUNT(*) as count, AVG(progress) as avg_progress FROM projects WHERE user_id = $1`, [userId]),
      query(`SELECT COUNT(*) as count, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM tasks WHERE user_id = $1`, [userId]),
      query(`SELECT COUNT(*) as count, SUM(amount) as total FROM expenses WHERE user_id = $1 AND expense_date >= NOW() - INTERVAL '30 days'`, [userId]),
      query(`SELECT COUNT(*) as count, SUM(amount) as total FROM income_streams WHERE user_id = $1`, [userId]),
      query(`SELECT COUNT(*) as count FROM daily_intentions WHERE user_id = $1 AND entry_date >= NOW() - INTERVAL '30 days'`, [userId]),
      query(`SELECT COUNT(*) as count FROM unload_entries WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [userId]).catch(() => ({ rows: [{ count: '0' }] })),
      query(`SELECT COUNT(*) as count FROM calendar_events WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '30 days'`, [userId]),
      query(`SELECT COUNT(*) as count FROM lists WHERE user_id = $1`, [userId])
    ]);

    const stats = {
      projects: {
        total: parseInt(projectsResult.rows[0]?.count || 0),
        avgProgress: parseFloat(projectsResult.rows[0]?.avg_progress || 0)
      },
      tasks: {
        total: parseInt(tasksResult.rows[0]?.count || 0),
        completed: parseInt(tasksResult.rows[0]?.completed || 0)
      },
      expenses: {
        count: parseInt(expensesResult.rows[0]?.count || 0),
        total: parseFloat(expensesResult.rows[0]?.total || 0)
      },
      income: {
        count: parseInt(incomeResult.rows[0]?.count || 0),
        total: parseFloat(incomeResult.rows[0]?.total || 0)
      },
      intentions: parseInt(intentionsResult.rows[0]?.count || 0),
      emotions: parseInt(emotionsResult.rows[0]?.count || 0),
      calendar: parseInt(calendarResult.rows[0]?.count || 0),
      lists: parseInt(listsResult.rows[0]?.count || 0)
    };

    // Generate AI feedback based on stats
    const feedback = generateAccountFeedback(stats);

    // Store as an insight
    try {
      await query(
        `INSERT INTO knowledge_insights (user_id, scope, title, body, confidence, meta)
         VALUES ($1, 'account', $2, $3, $4, $5)`,
        [
          userId,
          feedback.title,
          feedback.body,
          0.9,
          { type: 'account_feedback', stats, generated_at: new Date().toISOString() }
        ]
      );
    } catch (e) {
      // If insights table doesn't exist, that's okay
      console.log('Could not store feedback as insight:', e.message);
    }

    res.json({
      success: true,
      feedback: {
        title: feedback.title,
        body: feedback.body,
        stats,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Account feedback error:', error);
    res.status(500).json({ error: 'Failed to generate account feedback.' });
  }
});

/**
 * Generate human-readable account feedback
 */
function generateAccountFeedback(stats) {
  const insights = [];
  const recommendations = [];

  // Project analysis
  if (stats.projects.total > 0) {
    if (stats.projects.avgProgress < 30) {
      insights.push(`You have ${stats.projects.total} active project${stats.projects.total > 1 ? 's' : ''}, but average progress is ${Math.round(stats.projects.avgProgress)}%.`);
      recommendations.push('Consider focusing on fewer projects or breaking them into smaller milestones.');
    } else if (stats.projects.avgProgress > 70) {
      insights.push(`Great progress! Your ${stats.projects.total} project${stats.projects.total > 1 ? 's are' : ' is'} ${Math.round(stats.projects.avgProgress)}% complete on average.`);
    } else {
      insights.push(`You're making steady progress across ${stats.projects.total} project${stats.projects.total > 1 ? 's' : ''} (${Math.round(stats.projects.avgProgress)}% average).`);
    }
  } else {
    insights.push('No active projects yet.');
    recommendations.push('Consider starting a project to track meaningful progress.');
  }

  // Task analysis
  if (stats.tasks.total > 0) {
    const completionRate = (stats.tasks.completed / stats.tasks.total) * 100;
    if (completionRate > 80) {
      insights.push(`Excellent task completion rate: ${Math.round(completionRate)}% (${stats.tasks.completed}/${stats.tasks.total} tasks).`);
    } else if (completionRate < 50) {
      insights.push(`Task completion rate is ${Math.round(completionRate)}% (${stats.tasks.completed}/${stats.tasks.total} tasks).`);
      recommendations.push('Try breaking down larger tasks or reviewing your task list regularly.');
    } else {
      insights.push(`You've completed ${stats.tasks.completed} of ${stats.tasks.total} tasks (${Math.round(completionRate)}% completion rate).`);
    }
  }

  // Financial analysis
  if (stats.expenses.count > 0 || stats.income.count > 0) {
    const net = stats.income.total - stats.expenses.total;
    if (net > 0) {
      insights.push(`Positive cash flow: $${net.toLocaleString()} net income after ${stats.expenses.count} expense${stats.expenses.count !== 1 ? 's' : ''} this month.`);
    } else if (net < 0) {
      insights.push(`Negative cash flow: $${Math.abs(net).toLocaleString()} more expenses than income this month.`);
      recommendations.push('Review your spending patterns and consider adjusting your budget.');
    }
    if (stats.expenses.count > 50) {
      insights.push(`You're tracking expenses actively (${stats.expenses.count} entries this month).`);
    }
  } else {
    insights.push('No financial data tracked yet.');
    recommendations.push('Start tracking income and expenses for better financial awareness.');
  }

  // Activity analysis
  if (stats.intentions > 0) {
    insights.push(`You've set ${stats.intentions} daily intention${stats.intentions !== 1 ? 's' : ''} in the last 30 days.`);
    if (stats.intentions < 10) {
      recommendations.push('Setting daily intentions more consistently can help focus your day.');
    }
  }

  if (stats.emotions > 0) {
    insights.push(`You've logged ${stats.emotions} emotion${stats.emotions !== 1 ? 's' : ''} in the last 30 days.`);
  }

  if (stats.calendar > 0) {
    insights.push(`You have ${stats.calendar} calendar event${stats.calendar !== 1 ? 's' : ''} scheduled this month.`);
  }

  if (stats.lists > 0) {
    insights.push(`You're using ${stats.lists} list${stats.lists !== 1 ? 's' : ''} to organize your thoughts.`);
  }

  // Overall assessment
  const totalActivity = stats.projects.total + stats.tasks.total + stats.intentions + stats.emotions + stats.calendar;
  let title, summary;

  if (totalActivity === 0) {
    title = 'Getting Started';
    summary = 'Your account is new. Start by creating a project, setting daily intentions, or tracking your expenses.';
  } else if (totalActivity < 20) {
    title = 'Building Momentum';
    summary = 'You\'re getting started with the system. Keep building consistency by using it daily.';
  } else if (totalActivity < 100) {
    title = 'Active User';
    summary = 'You\'re actively using the system. Great consistency!';
  } else {
    title = 'Power User';
    summary = 'You\'re making excellent use of the system with high engagement across multiple features.';
  }

  const body = [
    summary,
    '',
    '**Observations:**',
    ...insights.map(i => `• ${i}`),
    '',
    ...(recommendations.length > 0 ? [
      '**Recommendations:**',
      ...recommendations.map(r => `• ${r}`)
    ] : [])
  ].join('\n');

  return { title, body };
}

export default router;




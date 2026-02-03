import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};


// Initialize tables
const initTables = async () => {
  try {
    // Create expenses table
    await query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        note TEXT,
        expense_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add note column if it doesn't exist (for existing tables)
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'expenses' AND column_name = 'note'
        ) THEN
          ALTER TABLE expenses ADD COLUMN note TEXT;
        END IF;
      END $$;
    `);
    
    // Create income_streams table
    await query(`
      CREATE TABLE IF NOT EXISTS income_streams (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        company VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create subscriptions table
    await query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        next_billing_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_income_user_id ON income_streams(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`);
    
    console.log('Money tables initialized successfully');
  } catch (error) {
    console.error('Error initializing money tables:', error);
    throw error;
  }
};

let tablesInitialized = false;
const ensureTables = async () => {
  if (!tablesInitialized) {
    await initTables();
    tablesInitialized = true;
  } else {
    // Always check and add missing columns (for migrations)
    try {
      await query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'expenses' AND column_name = 'note'
          ) THEN
            ALTER TABLE expenses ADD COLUMN note TEXT;
          END IF;
        END $$;
      `);
    } catch (error) {
      // Ignore errors if table doesn't exist yet
      console.log('Note: Could not check/add note column (table may not exist yet)');
    }
  }
};

// GET /api/money/overview - Get complete money overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    // Ensure note column exists (migration for existing tables)
    try {
      await query(`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'expenses' AND column_name = 'note'
            ) THEN
              ALTER TABLE expenses ADD COLUMN note TEXT;
            END IF;
          END IF;
        END $$;
      `);
    } catch (error) {
      console.log('Note: Could not add note column:', error.message);
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const daysInMonth = now.getDate();

    // Get income streams
    const incomeResult = await query(
      `SELECT id, source, amount, frequency, company
       FROM income_streams
       WHERE user_id = $1
       ORDER BY amount DESC`,
      [req.user.id]
    );

    // Calculate total monthly income
    let totalMonthlyIncome = 0;
    incomeResult.rows.forEach(income => {
      const amount = parseFloat(income.amount) || 0;
      if (income.frequency === 'monthly') {
        totalMonthlyIncome += amount;
      } else if (income.frequency === 'weekly') {
        totalMonthlyIncome += amount * 4.33; // Average weeks per month
      } else if (income.frequency === 'quarterly') {
        totalMonthlyIncome += amount / 3;
      } else if (income.frequency === 'one-time') {
        // One-time income doesn't count toward monthly total
      }
    });

    // Get all subscriptions (for overview, we'll filter active ones for recurring obligations)
    const subscriptionsResult = await query(
      `SELECT id, name, amount, billing_cycle, next_billing_date, status
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY next_billing_date ASC`,
      [req.user.id]
    );

    // Calculate recurring obligations (monthly subscriptions)
    let recurringObligations = 0;
    subscriptionsResult.rows.forEach(sub => {
      if (sub.billing_cycle === 'monthly') {
        recurringObligations += parseFloat(sub.amount);
      }
    });

    // Get recent expenses
    // Ensure note column exists - add it if it doesn't exist
    try {
      await query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'expenses'
          ) THEN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'expenses' 
              AND column_name = 'note'
            ) THEN
              ALTER TABLE expenses ADD COLUMN note TEXT;
            END IF;
          END IF;
        END $$;
      `);
    } catch (migrationError) {
      console.error('Error adding note column:', migrationError.message);
      // Continue - we'll handle missing column in query if needed
    }
    
    const expensesResult = await query(
      `SELECT id, amount, category, description, note, expense_date, created_at
       FROM expenses
       WHERE user_id = $1
       ORDER BY expense_date DESC, created_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    // Calculate daily spending average
    const monthlyExpensesResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2 AND expense_date <= $3`,
      [req.user.id, monthStart, monthEnd]
    );

    const monthlyTotal = parseFloat(monthlyExpensesResult.rows[0].total) || 0;
    const dailySpendingAvg = daysInMonth > 0 ? monthlyTotal / daysInMonth : 0;

    res.json({
      totalMonthlyIncome: totalMonthlyIncome,
      recurringObligations: recurringObligations,
      dailySpendingAvg: dailySpendingAvg,
      monthlySpent: monthlyTotal,
      budgetLeft: Math.max(0, totalMonthlyIncome - monthlyTotal - recurringObligations),
      incomeStreams: incomeResult.rows.map(income => ({
        ...income,
        type: income.source.toLowerCase().includes('salary') ? 'salary' :
              income.source.toLowerCase().includes('freelance') ? 'freelance' :
              income.source.toLowerCase().includes('dividend') ? 'dividends' : 'other'
      })),
      subscriptions: subscriptionsResult.rows,
      recentExpenses: expensesResult.rows,
    });
  } catch (error) {
    console.error('Get overview error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch money overview.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/money - Get money overview
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    // Get all income streams
    const incomeResult = await query(
      `SELECT id, source, amount, frequency, company, created_at
       FROM income_streams
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Get all expenses (not just monthly)
    const expensesResult = await query(
      `SELECT id, amount, category, description, note, expense_date, created_at
       FROM expenses
       WHERE user_id = $1
       ORDER BY expense_date DESC, created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    // Get all subscriptions
    const subscriptionsResult = await query(
      `SELECT id, name, amount, billing_cycle, next_billing_date, status, created_at
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY next_billing_date ASC`,
      [req.user.id]
    );

    // Calculate totals
    const totalIncomeResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM income_streams
       WHERE user_id = $1`,
      [req.user.id]
    );

    const totalExpensesResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
       WHERE user_id = $1`,
      [req.user.id]
    );

    const totalIncome = parseFloat(totalIncomeResult.rows[0].total) || 0;
    const totalExpenses = parseFloat(totalExpensesResult.rows[0].total) || 0;

    res.json({
      income: incomeResult.rows,
      expenses: expensesResult.rows,
      subscriptions: subscriptionsResult.rows,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
    });
  } catch (error) {
    console.error('Get money error:', error);
    res.status(500).json({ error: 'Failed to fetch money data.' });
  }
});

// POST /api/money/income - Add income stream
router.post('/income', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { source, amount, frequency, company, start_date } = req.body;

    const result = await query(
      `INSERT INTO income_streams (user_id, source, amount, frequency, company)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, source, amount, frequency, company, created_at, updated_at`,
      [
        req.user.id, 
        source, 
        parseFloat(amount), 
        frequency,
        company || null
      ]
    );

    res.json({
      success: true,
      income: result.rows[0],
    });
  } catch (error) {
    console.error('Add income error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to add income stream.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/money/subscriptions - Add subscription
router.post('/subscriptions', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { name, amount, billing_cycle, next_billing_date, status } = req.body;

    const result = await query(
      `INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, amount, billing_cycle, next_billing_date, status, created_at, updated_at`,
      [
        req.user.id, 
        name, 
        parseFloat(amount), 
        billing_cycle || 'monthly',
        next_billing_date,
        status || 'active'
      ]
    );

    res.json({
      success: true,
      subscription: result.rows[0],
    });
  } catch (error) {
    console.error('Add subscription error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to add subscription.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PATCH /api/money/subscriptions/:id - Update subscription (e.g., cancel)
router.patch('/subscriptions/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE subscriptions
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, amount, billing_cycle, next_billing_date, status`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    res.json({
      success: true,
      subscription: result.rows[0],
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription.' });
  }
});

// POST /api/money/expenses - Add expense
router.post('/expenses', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { amount, category, description, note, date } = req.body;

    const result = await query(
      `INSERT INTO expenses (user_id, amount, category, description, note, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, amount, category, description, note, expense_date, created_at`,
      [
        req.user.id, 
        parseFloat(amount), 
        category, 
        description || null,
        note || null,
        date || new Date().toISOString().split('T')[0]
      ]
    );

    res.json({
      success: true,
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Add expense error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to add expense.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/money/expenses/:id - Update expense
router.put('/expenses/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;
    const { amount, category, description, note, date } = req.body;

    const result = await query(
      `UPDATE expenses
       SET amount = $1, category = $2, description = $3, note = $4, expense_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, amount, category, description, note, expense_date, created_at`,
      [
        parseFloat(amount),
        category,
        description || null,
        note || null,
        date,
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json({
      success: true,
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
});

// DELETE /api/money/expenses/:id - Delete expense
router.delete('/expenses/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;

    const result = await query(
      `DELETE FROM expenses
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

// PUT /api/money/income/:id - Update income stream
router.put('/income/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;
    const { source, amount, frequency, company } = req.body;

    const result = await query(
      `UPDATE income_streams
       SET source = $1, amount = $2, frequency = $3, company = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING id, source, amount, frequency, company, created_at, updated_at`,
      [source, parseFloat(amount), frequency, company || null, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Income stream not found.' });
    }

    res.json({
      success: true,
      income: result.rows[0],
    });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Failed to update income stream.' });
  }
});

// DELETE /api/money/income/:id - Delete income stream
router.delete('/income/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;

    const result = await query(
      `DELETE FROM income_streams
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Income stream not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Failed to delete income stream.' });
  }
});

// PUT /api/money/subscriptions/:id - Update subscription
router.put('/subscriptions/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;
    const { name, amount, billing_cycle, next_billing_date, status } = req.body;

    const result = await query(
      `UPDATE subscriptions
       SET name = $1, amount = $2, billing_cycle = $3, next_billing_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, amount, billing_cycle, next_billing_date, status, created_at, updated_at`,
      [name, parseFloat(amount), billing_cycle, next_billing_date, status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    res.json({
      success: true,
      subscription: result.rows[0],
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription.' });
  }
});

// DELETE /api/money/subscriptions/:id - Delete subscription
router.delete('/subscriptions/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { id } = req.params;

    const result = await query(
      `DELETE FROM subscriptions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ error: 'Failed to delete subscription.' });
  }
});

export default router;

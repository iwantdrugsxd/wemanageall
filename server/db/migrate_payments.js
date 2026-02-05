import { query } from './config.js';

/**
 * Migration: Add plans, payments tables and update users table
 * for one-time payments and better plan management
 */
export async function migratePayments() {
  try {
    console.log('Starting payments migration...');

    // Create plans table
    await query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        price_inr INTEGER NOT NULL,
        interval VARCHAR(20) CHECK (interval IN ('monthly', 'yearly', 'one_time')),
        razorpay_plan_id TEXT,
        features JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id UUID REFERENCES plans(id),
        razorpay_payment_id TEXT UNIQUE,
        razorpay_order_id TEXT,
        razorpay_signature TEXT,
        amount_inr INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
        payment_type VARCHAR(20) DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'one_time')),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active)
    `);

    // Add columns to users table if they don't exist
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'plan_status'
        ) THEN
          ALTER TABLE users ADD COLUMN plan_status VARCHAR(20) DEFAULT 'free' CHECK (plan_status IN ('free', 'pro', 'premium', 'team'));
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'plan_id'
        ) THEN
          ALTER TABLE users ADD COLUMN plan_id UUID REFERENCES plans(id);
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'is_pro'
        ) THEN
          ALTER TABLE users ADD COLUMN is_pro BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);

    // Seed default plans if they don't exist
    const existingPlans = await query(`SELECT COUNT(*) as count FROM plans`);
    if (parseInt(existingPlans.rows[0].count) === 0) {
      await query(`
        INSERT INTO plans (name, price_inr, interval, features) VALUES
        ('Free', 0, 'one_time', '{"projects": 3, "calendarEvents": 50, "teamMembers": 0}'::jsonb),
        ('Starter Monthly', 19900, 'monthly', '{"projects": -1, "calendarEvents": -1, "teamMembers": 0}'::jsonb),
        ('Starter Annual', 199000, 'yearly', '{"projects": -1, "calendarEvents": -1, "teamMembers": 0}'::jsonb),
        ('Team Monthly', 49900, 'monthly', '{"projects": -1, "calendarEvents": -1, "teamMembers": 25}'::jsonb),
        ('Team Annual', 499000, 'yearly', '{"projects": -1, "calendarEvents": -1, "teamMembers": 25}'::jsonb)
      `);
    }

    console.log('✅ Payments migration completed successfully');
  } catch (error) {
    console.error('❌ Error in payments migration:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePayments()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

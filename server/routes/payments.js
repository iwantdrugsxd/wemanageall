import { Router } from 'express';
import { query } from '../db/config.js';
import { migratePayments } from '../db/migrate_payments.js';
import { razorpayInstance } from '../services/subscription.js';
import crypto from 'crypto';

const router = Router();

let migrationRun = false;
const ensureMigration = async () => {
  if (!migrationRun) {
    try {
      await migratePayments();
      migrationRun = true;
    } catch (error) {
      console.error('Migration error (non-fatal):', error);
    }
  }
};

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

/**
 * POST /api/payments/order
 * Create Razorpay order for one-time payment
 */
router.post('/order', requireAuth, async (req, res) => {
  try {
    await ensureMigration();
    
    if (!razorpayInstance) {
      return res.status(500).json({ error: 'Razorpay not configured.' });
    }

    const { amount_inr, plan_id, currency = 'INR' } = req.body;

    if (!amount_inr || amount_inr <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const amountInPaise = Math.round(amount_inr * 100); // Convert to paise

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        user_id: req.user.id,
        plan_id: plan_id || null,
      },
    });

    res.json({
      order_id: order.id,
      amount: amount_inr,
      amount_in_paise: amountInPaise,
      currency: currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and mark user as pro
 */
router.post('/verify', requireAuth, async (req, res) => {
  try {
    await ensureMigration();

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan_id } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification data is required.' });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured.' });
    }

    const amountInPaise = payment.amount;
    const amountInr = amountInPaise / 100;

    // Save payment to database
    const paymentResult = await query(
      `INSERT INTO payments 
       (user_id, plan_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, 
        amount_inr, currency, status, payment_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (razorpay_payment_id) DO NOTHING
       RETURNING *`,
      [
        req.user.id,
        plan_id || null,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amountInr,
        payment.currency,
        'captured',
        'one_time',
        JSON.stringify(payment),
      ]
    );

    // If plan_id provided, update user plan
    if (plan_id) {
      const planResult = await query(
        `SELECT * FROM plans WHERE id = $1`,
        [plan_id]
      );

      if (planResult.rows.length > 0) {
        const plan = planResult.rows[0];
        
        // Update user plan based on plan type
        if (plan.interval === 'one_time') {
          // One-time payment grants pro access
          await query(
            `UPDATE users 
             SET is_pro = true, plan_status = 'pro', plan_id = $1
             WHERE id = $2`,
            [plan_id, req.user.id]
          );
        } else if (plan.interval === 'monthly' || plan.interval === 'yearly') {
          // Subscription plan
          await query(
            `UPDATE users 
             SET plan_status = 'premium', plan_id = $1
             WHERE id = $2`,
            [plan_id, req.user.id]
          );
        }
      }
    } else {
      // No plan_id, just mark as pro for one-time payment
      await query(
        `UPDATE users SET is_pro = true, plan_status = 'pro' WHERE id = $1`,
        [req.user.id]
      );
    }

    res.json({
      success: true,
      payment: paymentResult.rows[0] || { razorpay_payment_id },
      message: 'Payment verified and user upgraded to Pro.',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

/**
 * GET /api/payments/history
 * Get user's payment history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    await ensureMigration();

    const result = await query(
      `SELECT p.*, pl.name as plan_name
       FROM payments p
       LEFT JOIN plans pl ON p.plan_id = pl.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json({
      payments: result.rows,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history.' });
  }
});

export default router;

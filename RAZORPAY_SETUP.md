# 💳 Razorpay Integration Setup Guide

Complete guide to set up Razorpay payment integration for subscription billing.

## 📋 Prerequisites

1. Razorpay account (sign up at https://razorpay.com)
2. Business verification completed
3. API keys from Razorpay dashboard

## 🔑 Step 1: Get Razorpay API Keys

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com
   - Login with your account

2. **Get API Keys**
   - Go to Settings → API Keys
   - Click "Generate Test Key" for development
   - Copy your **Key ID** and **Key Secret**

3. **Get Webhook Secret** (for production)
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/subscriptions/webhook`
   - Copy the **Webhook Secret**

## ⚙️ Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Frontend Razorpay Key (for checkout)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Important:**
- Use test keys (`rzp_test_...`) for development
- Use live keys (`rzp_live_...`) for production
- Never commit keys to git!

## 🗄️ Step 3: Run Database Migration

```bash
npm run db:migrate-subscriptions
```

This creates:
- `user_subscriptions` table
- `organization_subscriptions` table
- `subscription_history` table
- Adds subscription columns to `users` and `organizations` tables

## 🧪 Step 4: Test the Integration

### Test Payment Flow

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Go to Pricing page:**
   - Navigate to `/pricing`
   - Select a plan
   - Click "Subscribe"

3. **Test Payment:**
   - Use Razorpay test cards:
     - Success: `4111 1111 1111 1111`
     - CVV: Any 3 digits
     - Expiry: Any future date
     - Name: Any name

4. **Verify:**
   - Check subscription in database
   - Verify webhook received (check server logs)

## 📊 Step 5: Create Subscription Plans in Razorpay

### Option A: Automatic (Recommended)

The system automatically creates Razorpay plans when users subscribe. No manual setup needed!

### Option B: Manual Setup

If you want to create plans manually in Razorpay dashboard:

1. Go to Products → Plans
2. Create plans matching your pricing:
   - Premium: ₹750/month
   - Team Starter: ₹750/user/month
   - Team Pro: ₹1,500/user/month

## 🔔 Step 6: Configure Webhooks

### For Development (Local Testing)

Use a tool like **ngrok** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in Razorpay webhook settings
# Example: https://abc123.ngrok.io/api/subscriptions/webhook
```

### For Production

1. **Add Webhook in Razorpay:**
   - Go to Settings → Webhooks
   - Add URL: `https://yourdomain.com/api/subscriptions/webhook`
   - Select events:
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.cancelled`
     - `subscription.paused`
     - `payment.failed`

2. **Copy Webhook Secret:**
   - After creating webhook, copy the secret
   - Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_secret`

## 💰 Pricing Configuration

Current pricing (in `server/services/subscription.js`):

- **Free:** ₹0/month
- **Premium:** ₹750/month (or ₹7,500/year)
- **Team Starter:** ₹750/user/month (min 2 users)
- **Team Pro:** ₹1,500/user/month (min 6 users)
- **Enterprise:** Custom pricing

To change prices, edit `SUBSCRIPTION_PLANS` in `server/services/subscription.js`.

## 🔒 Security Checklist

- [ ] Use environment variables for all keys
- [ ] Never commit keys to git
- [ ] Use test keys in development
- [ ] Switch to live keys only in production
- [ ] Enable webhook signature verification
- [ ] Use HTTPS in production
- [ ] Set up webhook endpoint with authentication

## 🧪 Testing Checklist

- [ ] Test free plan (no payment)
- [ ] Test premium subscription
- [ ] Test team subscription
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test subscription cancellation
- [ ] Test webhook delivery
- [ ] Test subscription renewal

## 📱 Frontend Integration

The pricing page (`/pricing`) is already set up with:
- ✅ Plan display
- ✅ Razorpay checkout integration
- ✅ Payment success handling
- ✅ Subscription status display

Just add your Razorpay Key ID to `.env`:
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## 🚨 Troubleshooting

### Payment Not Processing
- Check Razorpay key ID is correct
- Verify keys are active in Razorpay dashboard
- Check browser console for errors
- Verify Razorpay script is loaded

### Webhook Not Working
- Verify webhook URL is accessible
- Check webhook secret matches
- Verify signature verification
- Check server logs for errors

### Subscription Not Activating
- Check webhook is received
- Verify database update queries
- Check subscription status in database
- Review server logs

## 📞 Support

- Razorpay Documentation: https://razorpay.com/docs
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/test-cards

## 🎯 Next Steps

1. ✅ Set up Razorpay account
2. ✅ Add API keys to `.env`
3. ✅ Run database migration
4. ✅ Test payment flow
5. ✅ Configure webhooks
6. ✅ Go live!

---

**Ready to accept payments!** 🎉


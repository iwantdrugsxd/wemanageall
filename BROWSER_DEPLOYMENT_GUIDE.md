# 🌐 Browser-Based Deployment Guide - wemanageall.in

Deploy your website entirely through your browser - no command line needed!

## 🎯 Choose Your Platform

### Option 1: Railway (Recommended - Easiest)
✅ Full-stack support (frontend + backend)  
✅ PostgreSQL included  
✅ Free tier available  
✅ Automatic HTTPS  
✅ Custom domain support  

### Option 2: Render
✅ Full-stack support  
✅ PostgreSQL included  
✅ Free tier available  
✅ Automatic HTTPS  

### Option 3: Vercel (Frontend) + Railway/Render (Backend)
✅ Best performance for frontend  
✅ Separate backend deployment  

---

## 🚀 Option 1: Deploy to Railway (Step-by-Step)

### Step 1: Sign Up / Login

1. **Go to:** https://railway.app
2. **Click:** "Start a New Project" or "Login"
3. **Sign up with:**
   - GitHub (recommended - easiest)
   - Google
   - Email

### Step 2: Create New Project

1. **Click:** "New Project" button (top right)
2. **Select:** "Deploy from GitHub repo"
3. **Authorize Railway** to access your GitHub (if first time)
4. **Select your repository:** `One-for-all`
5. **Click:** "Deploy Now"

### Step 3: Add PostgreSQL Database

1. **In your project dashboard**, click **"+ New"**
2. **Select:** "Database" → "Add PostgreSQL"
3. **Wait** for database to provision (30 seconds)
4. **Click on the database** service
5. **Go to:** "Variables" tab
6. **Copy these values:**
   - `DATABASE_URL` (you'll need this)

### Step 4: Configure Environment Variables

1. **Click on your main service** (the one deploying your code)
2. **Go to:** "Variables" tab
3. **Click:** "+ New Variable"
4. **Add these variables one by one:**

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=generate-random-32-chars-here

# Database (use the DATABASE_URL from PostgreSQL service)
DATABASE_URL=<paste from PostgreSQL service>

# Extract individual DB values from DATABASE_URL or add separately:
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<from DATABASE_URL>

DB_POOL_MIN=5
DB_POOL_MAX=20

# Your domain
CORS_ORIGIN=https://wemanageall.in
FRONTEND_URL=https://wemanageall.in

# Razorpay (Production keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://wemanageall.in/api/auth/google/callback
```

**Generate SESSION_SECRET:**
- Use: https://randomkeygen.com (use "CodeIgniter Encryption Keys")
- Or: https://www.lastpass.com/features/password-generator

### Step 5: Configure Build Settings

1. **Click on your service**
2. **Go to:** "Settings" tab
3. **Set Root Directory:** (leave empty if root, or set if in subfolder)
4. **Set Build Command:** `npm install && npm run build`
5. **Set Start Command:** `npm start`
6. **Set Watch Paths:** `server/**`

### Step 6: Run Database Migrations

1. **In your service**, go to **"Deployments"** tab
2. **Click on the latest deployment**
3. **Click:** "View Logs"
4. **Click:** "Run Command" (or use Railway CLI)

**Or use Railway CLI:**
1. **Install Railway CLI:** https://railway.app/cli
2. **Login:** `railway login`
3. **Link project:** `railway link`
4. **Run migrations:**
   ```bash
   railway run npm run db:init
   railway run npm run db:migrate-organizations
   railway run npm run db:migrate-calendar
   railway run npm run db:migrate-tasks-time
   railway run npm run db:migrate-subscriptions
   railway run npm run db:migrate-projects
   ```

### Step 7: Configure Custom Domain

1. **In your service**, go to **"Settings"** tab
2. **Scroll to:** "Domains" section
3. **Click:** "Custom Domain"
4. **Enter:** `wemanageall.in`
5. **Click:** "Add Domain"
6. **Railway will show you DNS records to add:**
   - Type: `CNAME`
   - Name: `@` or `wemanageall.in`
   - Value: `<railway-provided-value>.railway.app`

### Step 8: Update DNS in GoDaddy

1. **Go to:** https://dcc.godaddy.com
2. **Find:** `wemanageall.in` → Click → **"DNS"**
3. **Add CNAME record:**
   - **Type:** CNAME
   - **Name:** `@`
   - **Value:** `<railway-provided-value>.railway.app`
   - **TTL:** 600
4. **Add CNAME for www:**
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `<railway-provided-value>.railway.app`
   - **TTL:** 600
5. **Save** and wait 5-60 minutes for DNS propagation

### Step 9: Verify Deployment

1. **Check Railway dashboard** - service should show "Active"
2. **Visit:** https://wemanageall.in
3. **Test:** Sign up, login, create project
4. **Check logs** in Railway dashboard if issues

---

## 🚀 Option 2: Deploy to Render (Step-by-Step)

### Step 1: Sign Up

1. **Go to:** https://render.com
2. **Click:** "Get Started for Free"
3. **Sign up with:** GitHub (recommended)

### Step 2: Create Web Service

1. **Click:** "New +" → "Web Service"
2. **Connect repository:** Select `One-for-all`
3. **Configure:**
   - **Name:** `ofa-app`
   - **Region:** Choose closest to users
   - **Branch:** `main` or `master`
   - **Root Directory:** (leave empty)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### Step 3: Add PostgreSQL Database

1. **Click:** "New +" → "PostgreSQL"
2. **Configure:**
   - **Name:** `ofa-db`
   - **Database:** `ofa_db`
   - **User:** `ofa_user`
   - **Region:** Same as web service
3. **Click:** "Create Database"
4. **Copy:** `Internal Database URL`

### Step 4: Set Environment Variables

1. **In your Web Service**, go to **"Environment"** tab
2. **Add variables:**
   - Same as Railway (see Step 4 above)
   - Use `Internal Database URL` for `DATABASE_URL`

### Step 5: Configure Custom Domain

1. **In Web Service**, go to **"Settings"** tab
2. **Scroll to:** "Custom Domains"
3. **Add:** `wemanageall.in`
4. **Add:** `www.wemanageall.in`
5. **Copy DNS records** shown

### Step 6: Update DNS in GoDaddy

1. **Go to GoDaddy DNS**
2. **Add CNAME records** as shown by Render
3. **Wait for propagation**

### Step 7: Run Migrations

1. **In Web Service**, go to **"Shell"** tab
2. **Run commands:**
   ```bash
   npm run db:init
   npm run db:migrate-organizations
   npm run db:migrate-calendar
   npm run db:migrate-tasks-time
   npm run db:migrate-subscriptions
   npm run db:migrate-projects
   ```

---

## 🔧 Important Configuration Files

### Create `railway.json` (for Railway)

Create this file in your repo root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Create `render.yaml` (for Render)

Create this file in your repo root:

```yaml
services:
  - type: web
    name: ofa-app
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    domains:
      - wemanageall.in
      - www.wemanageall.in

databases:
  - name: ofa-db
    plan: free
```

---

## 💳 Configure Razorpay Webhook

### After Deployment:

1. **Get your webhook URL:**
   - Railway: `https://wemanageall.in/api/subscriptions/webhook`
   - Render: `https://wemanageall.in/api/subscriptions/webhook`

2. **In Razorpay Dashboard:**
   - Go to: Settings → Webhooks
   - Add webhook URL
   - Select events (see RAZORPAY_SETUP.md)
   - Copy webhook secret
   - Add to environment variables in Railway/Render

---

## ✅ Verification Checklist

- [ ] Service deployed and running
- [ ] Database connected
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Custom domain configured
- [ ] DNS updated in GoDaddy
- [ ] SSL certificate active (automatic)
- [ ] Website accessible at https://wemanageall.in
- [ ] Can sign up and login
- [ ] Razorpay webhook configured

---

## 🆘 Troubleshooting

### Deployment Fails

1. **Check build logs** in Railway/Render dashboard
2. **Verify environment variables** are set
3. **Check Node.js version** (should be 18+)
4. **Verify build command** is correct

### Database Connection Issues

1. **Check DATABASE_URL** is correct
2. **Verify database is running** in dashboard
3. **Check firewall rules** (should be automatic)

### Domain Not Working

1. **Wait 5-60 minutes** for DNS propagation
2. **Verify DNS records** in GoDaddy
3. **Check domain** in Railway/Render settings
4. **Test with:** `dig wemanageall.in`

### 500 Errors

1. **Check application logs** in dashboard
2. **Verify migrations** ran successfully
3. **Check environment variables** are set
4. **Verify database** is accessible

---

## 🎉 You're Live!

Once deployed, your site will be at:
- **https://wemanageall.in**
- **https://www.wemanageall.in**

---

## 📝 Quick Reference

### Railway Dashboard
- **URL:** https://railway.app/dashboard
- **Logs:** Click service → Deployments → View Logs
- **Variables:** Click service → Variables tab
- **Domain:** Click service → Settings → Domains

### Render Dashboard
- **URL:** https://dashboard.render.com
- **Logs:** Click service → Logs tab
- **Variables:** Click service → Environment tab
- **Domain:** Click service → Settings → Custom Domains

---

**Follow these steps in your browser and your site will be live! 🚀**


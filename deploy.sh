#!/bin/bash
# Deployment script for wemanageall.in
# Run this script on your production server

set -e

echo "🚀 Deploying wemanageall.in..."

# Navigate to project directory
cd /var/www/One-for-all || cd "$(dirname "$0")"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate-organizations || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-calendar || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-tasks-time || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-subscriptions || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-projects || echo "⚠️ Migration skipped (may already be run)"

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Restart application with PM2
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart ofa-app || pm2 start server/index.js --name ofa-app
    pm2 save
else
    echo "⚠️ PM2 not found. Please restart manually:"
    echo "   pm2 restart ofa-app"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should be live at: https://wemanageall.in"
echo "📊 Check logs: pm2 logs ofa-app"



# Deployment script for wemanageall.in
# Run this script on your production server

set -e

echo "🚀 Deploying wemanageall.in..."

# Navigate to project directory
cd /var/www/One-for-all || cd "$(dirname "$0")"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate-organizations || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-calendar || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-tasks-time || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-subscriptions || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-projects || echo "⚠️ Migration skipped (may already be run)"

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Restart application with PM2
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart ofa-app || pm2 start server/index.js --name ofa-app
    pm2 save
else
    echo "⚠️ PM2 not found. Please restart manually:"
    echo "   pm2 restart ofa-app"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should be live at: https://wemanageall.in"
echo "📊 Check logs: pm2 logs ofa-app"



# Deployment script for wemanageall.in
# Run this script on your production server

set -e

echo "🚀 Deploying wemanageall.in..."

# Navigate to project directory
cd /var/www/One-for-all || cd "$(dirname "$0")"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate-organizations || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-calendar || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-tasks-time || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-subscriptions || echo "⚠️ Migration skipped (may already be run)"
npm run db:migrate-projects || echo "⚠️ Migration skipped (may already be run)"

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Restart application with PM2
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart ofa-app || pm2 start server/index.js --name ofa-app
    pm2 save
else
    echo "⚠️ PM2 not found. Please restart manually:"
    echo "   pm2 restart ofa-app"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should be live at: https://wemanageall.in"
echo "📊 Check logs: pm2 logs ofa-app"






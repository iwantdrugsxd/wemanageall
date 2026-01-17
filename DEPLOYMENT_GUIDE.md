# 🚀 Deployment Guide - Multi-User Startup Platform

This guide will help you deploy OFA as a multi-user SaaS platform for your startup.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Production Setup](#production-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Options](#deployment-options)
6. [Multi-User Features](#multi-user-features)
7. [Scaling Considerations](#scaling-considerations)

## 🏃 Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Initialize database
npm run db:init
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time

# 4. Start development server
npm run dev
```

Access at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🏭 Production Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database (local or cloud)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

### Step 1: Environment Variables

Create a `.env` file in production:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secret-session-key-min-32-characters-long

# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/ofa_db
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=ofa_db
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=20

# CORS (Update with your domain)
CORS_ORIGIN=https://yourdomain.com

# Optional: Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Optional: OpenAI API (for AI features)
OPENAI_API_KEY=your-openai-api-key
```

### Step 2: Database Setup

```bash
# Connect to your production database
psql -h your-db-host -U your-db-user -d ofa_db

# Or use environment variable
psql $DATABASE_URL

# Run all migrations
npm run db:init
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time
npm run db:migrate-projects
```

### Step 3: Build Frontend

```bash
npm run build
```

This creates a `dist/` folder with optimized production assets.

### Step 4: Start Production Server

```bash
npm start
```

Or use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name ofa-api

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🌐 Deployment Options

### Option 1: VPS (DigitalOcean, AWS EC2, Linode)

**Recommended for startups**

1. **Set up VPS** (Ubuntu 22.04 LTS recommended)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install Nginx (for reverse proxy)
   sudo apt install -g nginx
   ```

2. **Clone and deploy**
   ```bash
   git clone your-repo-url
   cd One-for-all
   npm install --production
   npm run build
   ```

3. **Set up Nginx reverse proxy**
   ```nginx
   # /etc/nginx/sites-available/ofa
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           root /path/to/One-for-all/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-secret-key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Railway

1. **Connect GitHub repo** to Railway
2. **Add PostgreSQL** service
3. **Set environment variables** in Railway dashboard
4. **Deploy** automatically on git push

### Option 4: Docker (Coming Soon)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server/index.js"]
```

## 👥 Multi-User Features

### Organization/Workspace System

Your app already supports multi-user workspaces:

1. **Users can create organizations**
   - Go to `/organizations`
   - Click "Create Workspace"
   - Set name and description

2. **Invite team members**
   - Organization owner can invite via email
   - Members get invitation links
   - Role-based access (owner, admin, member, viewer)

3. **Switch between workspaces**
   - Users can belong to multiple organizations
   - Switch via dropdown in navigation
   - Data is scoped to current workspace

### Data Isolation

- Each user's data is isolated within their organization
- Users can work in "Individual" mode or "Team" mode
- Organization owners can see team analytics (future feature)

### Current Multi-User Support

✅ **Implemented:**
- Organization creation and management
- Team member invitations
- Role-based access control
- Workspace switching
- Data scoping by organization

🔄 **To Enable:**
- Update API routes to use organization context
- Add organization middleware to routes
- Test multi-user scenarios

## 🔧 Scaling Considerations

### Database

- **Connection Pooling**: Already configured (DB_POOL_MIN/MAX)
- **Indexes**: Ensure all foreign keys are indexed
- **Read Replicas**: For high traffic, use read replicas
- **Backup**: Set up automated daily backups

### Application

- **Load Balancing**: Use multiple instances behind a load balancer
- **Session Store**: PostgreSQL session store scales well
- **Caching**: Consider Redis for session storage at scale
- **CDN**: Use CloudFlare or similar for static assets

### Monitoring

- **Logging**: Set up centralized logging (e.g., Logtail, Datadog)
- **Error Tracking**: Use Sentry or similar
- **Performance**: Monitor response times and database queries
- **Uptime**: Use UptimeRobot or Pingdom

## 🔒 Security Checklist

- [ ] Use strong `SESSION_SECRET` (32+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set secure cookie flags in production
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups encrypted
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms

## 📊 Monitoring & Analytics

### Recommended Tools

1. **Application Monitoring**: PM2 Plus, New Relic, or Datadog
2. **Error Tracking**: Sentry
3. **Uptime Monitoring**: UptimeRobot
4. **Analytics**: Google Analytics or Plausible
5. **Database Monitoring**: pgAdmin or DataDog

## 🚀 Quick Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying OFA..."

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time

# Build frontend
npm run build

# Restart application
pm2 restart ofa-api

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## 📝 Next Steps

1. **Set up production database** (PostgreSQL)
2. **Configure environment variables**
3. **Run all migrations**
4. **Build and deploy**
5. **Set up SSL/HTTPS**
6. **Configure domain and DNS**
7. **Test multi-user functionality**
8. **Set up monitoring and backups**

## 🆘 Troubleshooting

### Database Connection Issues
- Check firewall rules
- Verify credentials in `.env`
- Test connection: `psql $DATABASE_URL`

### Session Issues
- Ensure `SESSION_SECRET` is set
- Check cookie settings in production
- Verify session table exists

### CORS Errors
- Update `CORS_ORIGIN` in `.env`
- Check Nginx/proxy headers
- Verify frontend URL matches

## 📞 Support

For issues or questions:
- Check existing documentation
- Review error logs
- Test in development first
- Check database migrations

---

**Ready to launch?** Follow the steps above and your multi-user platform will be live! 🎉


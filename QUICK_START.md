# ⚡ Quick Start Guide

Get your multi-user workspace platform running in 5 minutes!

## 🎯 For Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Make sure PostgreSQL is running
# On macOS: brew services start postgresql
# On Linux: sudo systemctl start postgresql

# 4. Initialize database
npm run db:init

# 5. Run migrations
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time

# 6. Start development server
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🚀 For Production Deployment

### Option A: Simple VPS Deployment

```bash
# On your server
git clone your-repo-url
cd One-for-all
npm install --production
npm run build

# Set up environment
nano .env  # Add production values

# Run migrations
npm run db:migrate-organizations
npm run db:migrate-calendar

# Start with PM2
npm install -g pm2
pm2 start server/index.js --name ofa
pm2 save
```

### Option B: Railway (Easiest)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Set environment variables
5. Deploy!

## 👥 Enable Multi-User Workspaces

Your app already has organization support! Here's how to use it:

1. **Sign up** a user account
2. **Go to** `/organizations` page
3. **Create** a workspace
4. **Invite** team members via email
5. **Switch** between workspaces using the dropdown

## 📋 Checklist Before Launch

- [ ] PostgreSQL database set up
- [ ] Environment variables configured
- [ ] All migrations run
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] Session secret is strong (32+ chars)
- [ ] Database backups configured
- [ ] Monitoring set up

## 🆘 Common Issues

**Database connection fails:**
- Check PostgreSQL is running
- Verify credentials in `.env`
- Test: `psql -h localhost -U postgres -d ofa_db`

**Port already in use:**
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

**Migrations fail:**
- Check database exists
- Verify user has CREATE permissions
- Run migrations one by one

## 📚 Next Steps

- Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- Check [TEAM_IMPLEMENTATION_GUIDE.md](./TEAM_IMPLEMENTATION_GUIDE.md) for multi-user features
- Review [README.md](./README.md) for project overview

---

**Need help?** Check the documentation or review error logs.


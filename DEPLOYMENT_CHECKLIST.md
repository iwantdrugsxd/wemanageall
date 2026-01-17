# ✅ Deployment Checklist for wemanageall.in

Use this checklist to ensure everything is set up correctly before going live.

## 🖥️ Server Setup

- [ ] VPS/Server provisioned (Ubuntu 22.04 LTS)
- [ ] SSH access working
- [ ] Server IP noted
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Nginx installed and running
- [ ] PM2 installed globally (`npm install -g pm2`)

## 🌐 Domain & DNS

- [ ] DNS A record for `@` pointing to server IP
- [ ] DNS A record for `www` pointing to server IP
- [ ] DNS propagation verified (`dig wemanageall.in`)
- [ ] Domain accessible via HTTP (before SSL)

## 🗄️ Database

- [ ] PostgreSQL database created (`ofa_db`)
- [ ] Database user created (`ofa_user`)
- [ ] Database password set (strong password)
- [ ] Database connection tested
- [ ] All migrations run:
  - [ ] `npm run db:init`
  - [ ] `npm run db:migrate-organizations`
  - [ ] `npm run db:migrate-calendar`
  - [ ] `npm run db:migrate-tasks-time`
  - [ ] `npm run db:migrate-subscriptions`
  - [ ] `npm run db:migrate-projects`

## 📦 Application

- [ ] Code cloned to `/var/www/One-for-all`
- [ ] Dependencies installed (`npm install --production`)
- [ ] Frontend built (`npm run build`)
- [ ] `.env` file created with all variables
- [ ] `SESSION_SECRET` generated (32+ characters)
- [ ] Database credentials correct in `.env`
- [ ] CORS_ORIGIN set to `https://wemanageall.in`
- [ ] Application starts without errors

## 🔒 SSL/HTTPS

- [ ] Nginx configured for domain
- [ ] Certbot installed
- [ ] SSL certificate obtained (`certbot --nginx`)
- [ ] HTTPS redirect working
- [ ] SSL certificate auto-renewal set up
- [ ] Website accessible at `https://wemanageall.in`

## 💳 Razorpay

- [ ] Razorpay account created
- [ ] Live API keys obtained (not test keys)
- [ ] `RAZORPAY_KEY_ID` set in `.env` (rzp_live_...)
- [ ] `RAZORPAY_KEY_SECRET` set in `.env`
- [ ] `VITE_RAZORPAY_KEY_ID` set in `.env`
- [ ] Webhook created in Razorpay dashboard
- [ ] Webhook URL: `https://wemanageall.in/api/subscriptions/webhook`
- [ ] Webhook events selected:
  - [ ] `subscription.activated`
  - [ ] `subscription.charged`
  - [ ] `subscription.cancelled`
  - [ ] `subscription.paused`
  - [ ] `payment.failed`
- [ ] `RAZORPAY_WEBHOOK_SECRET` copied to `.env`
- [ ] Webhook tested (Razorpay dashboard)

## 🚀 Process Management

- [ ] PM2 process running (`pm2 status`)
- [ ] PM2 auto-start configured (`pm2 startup`)
- [ ] Application accessible via PM2 (`pm2 logs ofa-app`)
- [ ] Application restarts on server reboot

## 🔐 Security

- [ ] Firewall configured (UFW)
- [ ] Only ports 22, 80, 443 open
- [ ] Strong passwords set
- [ ] `.env` file permissions secure (not world-readable)
- [ ] PostgreSQL only accepts local connections
- [ ] Regular backups configured

## 🧪 Testing

- [ ] Website loads at `https://wemanageall.in`
- [ ] SSL certificate valid (green lock)
- [ ] Can create account (signup works)
- [ ] Can login
- [ ] Dashboard loads
- [ ] Projects page works
- [ ] Calendar works
- [ ] Money/Expense tracker works
- [ ] Pricing page loads
- [ ] Can initiate payment (test mode)
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Mobile responsive

## 📊 Monitoring

- [ ] PM2 monitoring set up
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Error logging working
- [ ] Database backups scheduled
- [ ] Log rotation configured

## 📝 Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Backup process documented
- [ ] Update process documented
- [ ] Team access configured (if applicable)

## 🎯 Post-Deployment

- [ ] First admin account created
- [ ] Test subscription created (test payment)
- [ ] Webhook received and processed
- [ ] Email notifications working (if configured)
- [ ] Analytics set up (if using)
- [ ] Performance tested
- [ ] Load tested (if expecting traffic)

## 🆘 Emergency Contacts

- [ ] Server provider support contact
- [ ] Domain registrar support (GoDaddy)
- [ ] Database backup location noted
- [ ] Rollback plan documented

---

## Quick Health Check Commands

```bash
# Check if app is running
pm2 status

# Check Nginx
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql

# Check SSL
certbot certificates

# Check logs
pm2 logs ofa-app
tail -f /var/log/nginx/error.log

# Test database
psql -U ofa_user -d ofa_db -h localhost
```

---

**Once all items are checked, your site is ready for production! 🚀**


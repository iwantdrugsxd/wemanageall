# 🚀 Deploy to wemanageall.in - Complete Guide

Step-by-step guide to deploy your OFA platform to **wemanageall.in**.

## 📋 Prerequisites Checklist

- [x] Domain: **wemanageall.in** (you have this in GoDaddy)
- [ ] VPS/Server (DigitalOcean, AWS, Linode, etc.)
- [ ] PostgreSQL database (can be on same server or cloud)
- [ ] Razorpay account with live keys
- [ ] SSH access to your server

## 🖥️ Step 1: Set Up Your Server

### Option A: DigitalOcean (Recommended - Easy & Affordable)

1. **Create Droplet:**
   - Go to https://digitalocean.com
   - Create new Droplet
   - Choose: **Ubuntu 22.04 LTS**
   - Size: **$12/month (2GB RAM)** or higher
   - Region: Choose closest to your users
   - Add SSH key or password

2. **Note your server IP** (you'll need this for DNS)

### Option B: AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Configure security groups (open ports 22, 80, 443)
3. Note your public IP

### Option C: Any VPS Provider

- Ubuntu 22.04 LTS
- Minimum: 2GB RAM, 1 CPU, 20GB storage
- Public IP address

## 🔧 Step 2: Initial Server Setup

SSH into your server:

```bash
ssh root@your-server-ip
```

### Update System

```bash
# Update packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential
```

### Install Node.js 18+

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

### Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE ofa_db;
CREATE USER ofa_user WITH ENCRYPTED PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE ofa_db TO ofa_user;
\q
EOF
```

**Important:** Replace `'your-secure-password-here'` with a strong password!

### Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Set up PM2 to start on boot
pm2 startup systemd
# Follow the instructions it gives you
```

## 🌐 Step 3: Configure Domain in GoDaddy

### Update DNS Records

1. **Go to GoDaddy Domain Manager:**
   - Login to https://dcc.godaddy.com
   - Go to "Portfolio" → Find "wemanageall.in"
   - Click on the domain

2. **Update DNS Settings:**
   - Go to DNS Management
   - Add/Update these records:

   ```
   Type: A
   Name: @
   Value: your-server-ip
   TTL: 600

   Type: A
   Name: www
   Value: your-server-ip
   TTL: 600
   ```

3. **Save changes** (DNS propagation takes 5-60 minutes)

### Verify DNS

```bash
# Check if DNS is pointing to your server
dig wemanageall.in
nslookup wemanageall.in
```

Both should show your server IP.

## 📦 Step 4: Deploy Your Application

### Clone Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/your-username/One-for-all.git
# OR if you have SSH access:
# git clone git@github.com:your-username/One-for-all.git

cd One-for-all
```

### Install Dependencies

```bash
# Install production dependencies
npm install --production

# Build frontend
npm run build
```

### Set Up Environment Variables

```bash
# Create .env file
nano .env
```

Add these values (replace with your actual values):

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=generate-a-random-32-character-secret-here

# Database (Production)
DATABASE_URL=postgresql://ofa_user:your-secure-password-here@localhost:5432/ofa_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ofa_db
DB_USER=ofa_user
DB_PASSWORD=your-secure-password-here

# Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=20

# CORS (Your domain)
CORS_ORIGIN=https://wemanageall.in

# Frontend URL
FRONTEND_URL=https://wemanageall.in

# Razorpay (Production Keys - Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Frontend Razorpay Key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://wemanageall.in/api/auth/google/callback

# Optional: OpenAI
OPENAI_API_KEY=your-openai-key
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter)

### Initialize Database

```bash
# Run all migrations
npm run db:init
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time
npm run db:migrate-subscriptions
npm run db:migrate-projects
```

## 🔒 Step 5: Set Up SSL (HTTPS)

### Install Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### Configure Nginx (Before SSL)

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/wemanageall.in
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name wemanageall.in www.wemanageall.in;

    # Frontend (React app)
    location / {
        root /var/www/One-for-all/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
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
        
        # Increase timeouts for long requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/One-for-all/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save and exit.

### Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/wemanageall.in /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Get SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d wemanageall.in -d www.wemanageall.in

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

Certbot will automatically:
- Get SSL certificate from Let's Encrypt
- Update Nginx configuration
- Set up auto-renewal

### Verify SSL

Visit: https://wemanageall.in

You should see a secure connection (🔒 icon in browser).

## 🚀 Step 6: Start Your Application

### Start with PM2

```bash
cd /var/www/One-for-all

# Start application
pm2 start server/index.js --name ofa-app

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs ofa-app
```

### Set Up Auto-Restart

PM2 should already be set up from earlier, but verify:

```bash
pm2 startup
# Follow the command it gives you
```

## 🔔 Step 7: Configure Razorpay Webhook

### Get Webhook URL

Your webhook URL is:
```
https://wemanageall.in/api/subscriptions/webhook
```

### Set Up in Razorpay Dashboard

1. **Login to Razorpay:** https://dashboard.razorpay.com
2. **Go to:** Settings → Webhooks
3. **Add Webhook:**
   - URL: `https://wemanageall.in/api/subscriptions/webhook`
   - Select events:
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.cancelled`
     - `subscription.paused`
     - `payment.failed`
4. **Copy Webhook Secret** and add to `.env`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```
5. **Restart application:**
   ```bash
   pm2 restart ofa-app
   ```

## ✅ Step 8: Verify Everything Works

### Test Checklist

1. **Website loads:** https://wemanageall.in
2. **SSL works:** Green lock icon in browser
3. **Can sign up:** Create a test account
4. **Can login:** Login works
5. **Dashboard loads:** Can see dashboard
6. **API works:** Check browser console for errors
7. **Database connected:** No errors in PM2 logs

### Check Logs

```bash
# Application logs
pm2 logs ofa-app

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

## 🔄 Step 9: Set Up Auto-Deployment (Optional)

### Create Deployment Script

```bash
nano /var/www/One-for-all/deploy.sh
```

Add:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying wemanageall.in..."

cd /var/www/One-for-all

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time
npm run db:migrate-subscriptions

# Build frontend
npm run build

# Restart application
pm2 restart ofa-app

echo "✅ Deployment complete!"
```

Make executable:

```bash
chmod +x /var/www/One-for-all/deploy.sh
```

### Future Deployments

```bash
# Just run the script
/var/www/One-for-all/deploy.sh
```

## 🔐 Step 10: Security Hardening

### Firewall Setup

```bash
# Install UFW (firewall)
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### Secure PostgreSQL

```bash
# Edit PostgreSQL config
nano /etc/postgresql/14/main/pg_hba.conf

# Make sure only local connections allowed:
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
systemctl restart postgresql
```

### Set Up Backups

```bash
# Create backup script
nano /var/www/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ofa"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U ofa_user ofa_db > $BACKUP_DIR/ofa_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: ofa_db_$DATE.sql"
```

Make executable and schedule:

```bash
chmod +x /var/www/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /var/www/backup-db.sh
```

## 📊 Step 11: Monitoring

### PM2 Monitoring

```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs

# Check status
pm2 status
```

### Set Up Uptime Monitoring

1. **UptimeRobot** (Free): https://uptimerobot.com
   - Add monitor for https://wemanageall.in
   - Get email alerts if site goes down

2. **Pingdom** or **StatusCake** (Alternatives)

## 🎯 Quick Reference Commands

```bash
# View application logs
pm2 logs ofa-app

# Restart application
pm2 restart ofa-app

# Stop application
pm2 stop ofa-app

# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# Check PostgreSQL
systemctl status postgresql

# View database
sudo -u postgres psql -d ofa_db

# Check SSL certificate
certbot certificates

# Renew SSL (auto, but can manual)
certbot renew
```

## 🆘 Troubleshooting

### Website Not Loading

```bash
# Check if app is running
pm2 status

# Check Nginx
systemctl status nginx
nginx -t

# Check logs
pm2 logs ofa-app
tail -f /var/log/nginx/error.log
```

### Database Connection Issues

```bash
# Test connection
psql -U ofa_user -d ofa_db -h localhost

# Check PostgreSQL is running
systemctl status postgresql

# Check .env file
cat /var/www/One-for-all/.env | grep DB_
```

### SSL Certificate Issues

```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --dry-run

# Check Nginx config
nginx -t
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

## ✅ Final Checklist

- [ ] Server set up (Ubuntu 22.04)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and database created
- [ ] Nginx installed and configured
- [ ] Domain DNS pointing to server
- [ ] SSL certificate installed
- [ ] Application deployed and running
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Razorpay webhook configured
- [ ] PM2 running application
- [ ] Firewall configured
- [ ] Backups set up
- [ ] Monitoring configured
- [ ] Website accessible at https://wemanageall.in

## 🎉 You're Live!

Your website should now be accessible at:
- **https://wemanageall.in**
- **https://www.wemanageall.in**

## 📝 Next Steps

1. **Test signup/login** - Create your first account
2. **Test subscription** - Try the pricing page
3. **Set up monitoring** - Get alerts if site goes down
4. **Regular backups** - Verify backups are working
5. **Monitor logs** - Check for any errors

## 🚀 Future Updates

To update your site:

```bash
cd /var/www/One-for-all
git pull
npm install --production
npm run build
pm2 restart ofa-app
```

Or use the deploy script:
```bash
/var/www/One-for-all/deploy.sh
```

---

**Congratulations! Your platform is now live at wemanageall.in! 🎉**


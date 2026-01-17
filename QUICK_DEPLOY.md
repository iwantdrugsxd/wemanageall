# ⚡ Quick Deploy Guide - wemanageall.in

**Fastest way to get your site live!**

## 🎯 Prerequisites

1. **Server** (DigitalOcean, AWS, etc.) - Ubuntu 22.04
2. **Domain** - wemanageall.in (you have this!)
3. **Razorpay Account** - For payments

## 🚀 5-Minute Setup

### 1. Server Setup (One-time)

```bash
# SSH into your server
ssh root@your-server-ip

# Run these commands:
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs postgresql nginx
npm install -g pm2

# Create database
sudo -u postgres psql -c "CREATE DATABASE ofa_db;"
sudo -u postgres psql -c "CREATE USER ofa_user WITH PASSWORD 'your-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ofa_db TO ofa_user;"
```

### 2. Deploy Code

```bash
cd /var/www
git clone your-repo-url One-for-all
cd One-for-all
npm install --production
npm run build
```

### 3. Configure Environment

```bash
nano .env
```

Paste this (update with your values):

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://ofa_user:your-password@localhost:5432/ofa_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ofa_db
DB_USER=ofa_user
DB_PASSWORD=your-password
CORS_ORIGIN=https://wemanageall.in
FRONTEND_URL=https://wemanageall.in
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### 4. Initialize Database

```bash
npm run db:init
npm run db:migrate-organizations
npm run db:migrate-calendar
npm run db:migrate-tasks-time
npm run db:migrate-subscriptions
npm run db:migrate-projects
```

### 5. Configure Nginx

```bash
nano /etc/nginx/sites-available/wemanageall.in
```

Paste:

```nginx
server {
    listen 80;
    server_name wemanageall.in www.wemanageall.in;

    location / {
        root /var/www/One-for-all/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:

```bash
ln -s /etc/nginx/sites-available/wemanageall.in /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 6. Get SSL Certificate

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d wemanageall.in -d www.wemanageall.in
```

### 7. Start Application

```bash
cd /var/www/One-for-all
pm2 start server/index.js --name ofa-app
pm2 save
pm2 startup
```

### 8. Configure DNS in GoDaddy

1. Go to https://dcc.godaddy.com
2. Find wemanageall.in → DNS
3. Add A record:
   - Name: `@`
   - Value: `your-server-ip`
4. Add A record:
   - Name: `www`
   - Value: `your-server-ip`

## ✅ Done!

Your site is live at: **https://wemanageall.in**

## 🔄 Future Updates

```bash
cd /var/www/One-for-all
./deploy.sh
```

Or manually:

```bash
git pull
npm install --production
npm run build
pm2 restart ofa-app
```

## 🆘 Need Help?

See full guide: `DEPLOY_TO_WEMANAGEALL.md`


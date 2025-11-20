# Deployment Guide

## Option 1: Deploy to Railway (Recommended - Easiest)

Railway offers automatic deployments and PostgreSQL database hosting.

### Steps:

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Project**
```bash
cd fantasy-investment-app
railway init
```

4. **Add PostgreSQL Database**
```bash
railway add
# Select PostgreSQL
```

5. **Set Environment Variables**
```bash
railway variables set JWT_SECRET="your-super-secret-key"
railway variables set ALPHA_VANTAGE_API_KEY="your-api-key"
railway variables set NODE_ENV="production"
```

6. **Deploy**
```bash
railway up
```

7. **Get Your URL**
```bash
railway domain
```

Your app will be live! Railway automatically handles SSL certificates.

## Option 2: Deploy to Fly.io

Fly.io offers edge deployment with great performance.

### Steps:

1. **Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login**
```bash
fly auth login
```

3. **Launch App**
```bash
cd fantasy-investment-app
fly launch
```

4. **Set Secrets**
```bash
fly secrets set JWT_SECRET="your-super-secret-key"
fly secrets set ALPHA_VANTAGE_API_KEY="your-api-key"
```

5. **Deploy**
```bash
fly deploy
```

6. **Add PostgreSQL (optional)**
```bash
fly postgres create
fly postgres attach
```

## Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

### Backend on Railway:
Follow Railway steps above for backend only.

### Frontend on Vercel:

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy Frontend**
```bash
cd client
vercel
```

3. **Set Environment Variables in Vercel Dashboard**
- Add `REACT_APP_API_URL` pointing to your Railway backend URL

4. **Redeploy**
```bash
vercel --prod
```

## Option 4: Traditional VPS (DigitalOcean, Linode, AWS)

### Prerequisites:
- Ubuntu 22.04 server
- Domain name (optional)
- SSH access

### Steps:

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

4. **Clone your repository**
```bash
git clone https://github.com/yourusername/fantasy-investment-app.git
cd fantasy-investment-app
```

5. **Install dependencies**
```bash
cd server && npm install
cd ../client && npm install && npm run build
```

6. **Set up environment variables**
```bash
cd ../server
nano .env
# Add your variables
```

7. **Start with PM2**
```bash
pm2 start server.js --name investleague
pm2 save
pm2 startup
```

8. **Set up Nginx (optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/investleague
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/investleague /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Set up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables Checklist

Make sure to set these in your deployment platform:

### Required:
- `JWT_SECRET` - Strong random string
- `ALPHA_VANTAGE_API_KEY` - Get from alphavantage.co
- `NODE_ENV` - Set to "production"

### Optional:
- `PORT` - Default: 5000
- `DATABASE_PATH` - For SQLite file location
- `FRONTEND_URL` - For CORS configuration

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login functionality
- [ ] Create a test league
- [ ] Execute a test trade
- [ ] Check real-time market data updates
- [ ] Test on mobile devices
- [ ] Set up monitoring (e.g., UptimeRobot)
- [ ] Configure automatic backups
- [ ] Set up error logging (e.g., Sentry)
- [ ] Enable rate limiting
- [ ] Configure CDN for static assets

## Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible
- **Logs**: Papertrail, Loggly

### Regular Maintenance:
- Weekly database backups
- Monthly dependency updates
- Quarterly security audits
- Monitor API usage and costs

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_PATH environment variable
- Ensure write permissions on database directory

### "API rate limit exceeded"
- Upgrade to paid API tier
- Implement caching layer
- Add Redis for temporary storage

### "WebSocket connection failed"
- Check firewall rules
- Ensure WebSocket support on hosting platform
- Verify HTTPS is properly configured

## Cost Estimates

### Free Tier (Development):
- Railway: Free tier available
- Fly.io: Free tier available
- Vercel: Free for frontend
- Total: $0/month

### Small Scale (< 100 users):
- Railway Hobby: $5/month
- Alpha Vantage Free: $0/month
- Total: $5/month

### Medium Scale (100-1000 users):
- Railway Pro: $20/month
- Finnhub Basic: $30/month
- Total: $50/month

### Large Scale (1000+ users):
- VPS/Cloud: $50-200/month
- Premium API: $100-500/month
- CDN: $20-100/month
- Total: $170-800/month

## Scaling Strategy

1. **Phase 1 (0-100 users)**: Free/cheap hosting, SQLite, free API tier
2. **Phase 2 (100-1000 users)**: Paid hosting, PostgreSQL, basic API tier
3. **Phase 3 (1000-10000 users)**: VPS, caching, premium API
4. **Phase 4 (10000+ users)**: Load balancing, microservices, enterprise API

---

Need help? Contact support or check the main README.md

# InvestLeague - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Setup (First Time Only)
```bash
# Navigate to project directory
cd fantasy-investment-app

# Run setup script
chmod +x setup.sh
./setup.sh

# OR manually:
cd server && npm install
cd ../client && npm install
```

### Step 2: Configure API Key
```bash
# Edit server/.env
cd server
nano .env

# Add your Alpha Vantage API key:
ALPHA_VANTAGE_API_KEY=your-key-here

# Get free key: https://www.alphavantage.co/support/#api-key
```

### Step 3: Start the App
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend (new terminal)
cd client
npm start

# App opens at: http://localhost:3000
```

## 📱 Using the App

### Create Your First League
1. Sign up / Log in
2. Click "Create League"
3. Set league name, dates, and rules
4. Share invite code with friends

### Join a League
1. Get invite code from commissioner
2. Click "Join League"
3. Enter code
4. Start with allocated cash

### Make Your First Trade
1. Click "Trade" tab
2. Search for stock (e.g., "AAPL")
3. Select stock from results
4. Enter quantity
5. Click "Place Buy Order"

### Track Performance
- **Dashboard**: Portfolio overview and chart
- **Portfolio**: Detailed holdings table
- **Leaderboard**: See rankings
- **Leagues**: Manage your competitions

## 🔑 Key Features

### League Customization
- **Start/End Dates**: Any duration (1 day to 1 year+)
- **Starting Cash**: $1,000 to $1,000,000+
- **Max Position**: 10% to 100% per stock
- **Asset Types**: Stocks only, or add options/crypto
- **Trading Hours**: Market hours or 24/7

### Trading Rules
- Trades execute at market price
- Commission-free (configurable)
- Real-time price updates
- Transaction history tracking

### Scoring
- Ranked by total portfolio value
- Returns shown as % and $
- Daily/weekly/all-time tracking

## 🛠️ Common Tasks

### Reset Database
```bash
cd server
rm investleague.db
# Database recreates on next server start
```

### Update Dependencies
```bash
# Backend
cd server && npm update

# Frontend
cd client && npm update
```

### Build for Production
```bash
# Backend - no build needed
# Frontend
cd client
npm run build
# Output in client/build/
```

### Deploy to Railway
```bash
railway login
railway init
railway add  # Add PostgreSQL
railway variables set JWT_SECRET="your-secret"
railway variables set ALPHA_VANTAGE_API_KEY="your-key"
railway up
```

## 📊 API Quick Reference

### Get Stock Quote
```javascript
GET /api/market/quote/AAPL
```

### Search Stocks
```javascript
GET /api/market/search?q=apple
```

### Create League
```javascript
POST /api/leagues
{
  "name": "My League",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "startingCash": 100000
}
```

### Execute Trade
```javascript
POST /api/trade
{
  "leagueId": 1,
  "symbol": "AAPL",
  "type": "BUY",
  "shares": 10,
  "price": 185.92
}
```

## 🔧 Troubleshooting

### "Cannot connect to server"
- Check backend is running on port 5000
- Check frontend proxy in package.json

### "API key invalid"
- Verify key in server/.env
- Check Alpha Vantage account status
- Use "demo" for testing (limited data)

### "Database locked"
- Close all connections
- Restart server
- Consider upgrading to PostgreSQL

### "Module not found"
- Run `npm install` in both directories
- Clear node_modules and reinstall
- Check Node version (16+ required)

## 💡 Tips & Best Practices

### Development
- Use mock data for testing
- Enable hot reload (nodemon)
- Check console for errors
- Test on mobile viewport

### Production
- Change JWT_SECRET
- Use PostgreSQL not SQLite
- Enable HTTPS
- Set up monitoring
- Configure backups

### Performance
- Implement caching for quotes
- Batch API requests
- Use CDN for assets
- Optimize database queries

## 📞 Support

### Resources
- **Main Docs**: README.md
- **Deployment**: DEPLOYMENT.md
- **Structure**: PROJECT_STRUCTURE.md
- **API Docs**: See server/server.js

### Get Help
- GitHub Issues
- Email: your-email@example.com
- Discord: [Your server]

## 🎯 Next Steps

1. **Customize Design**: Edit colors in tailwind.config.js
2. **Add Features**: See PROJECT_STRUCTURE.md Phase 2
3. **Deploy**: Follow DEPLOYMENT.md
4. **Scale**: Implement caching and upgrade API
5. **Monetize**: Add premium features

## 📈 Upgrade Path

### Free Tier → Paid Tier
1. Upgrade Alpha Vantage to Basic ($30/mo)
2. Deploy to Railway Hobby ($5/mo)
3. Total: $35/mo for 1000+ users

### Medium Scale
1. Switch to Finnhub ($30-100/mo)
2. Add PostgreSQL + Redis
3. Use CDN for assets
4. Total: $50-150/mo

### Enterprise
1. Premium API (Polygon, IEX)
2. Dedicated servers
3. Load balancing
4. 24/7 monitoring
5. Total: $500-2000/mo

---

**Built with ❤️ for fantasy stock market competition**

Remember: This is educational/entertainment software. Not financial advice!

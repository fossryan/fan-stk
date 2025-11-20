# InvestLeague - Fantasy Investment Competition Platform

A full-stack application for creating and managing fantasy stock market competitions with friends. Compete to see who can achieve the highest returns over a specified time period with real-time market data.

## 🚀 Features

### Core Features
- ✅ **Real-time Market Data**: Live stock prices using Alpha Vantage API (upgradeable to premium APIs)
- ✅ **League Management**: Create custom leagues with customizable rules and time periods
- ✅ **Live Trading**: Buy and sell stocks in real-time during trading hours
- ✅ **Leaderboards**: Track rankings and compare performance with friends
- ✅ **Portfolio Tracking**: Monitor your holdings, cash balance, and total returns
- ✅ **Transaction History**: Complete audit trail of all trades
- ✅ **Invite System**: Unique invite codes for joining leagues
- ✅ **Mobile Responsive**: Works seamlessly on all devices

### League Customization
- Custom start/end dates
- Configurable starting capital
- Maximum position size limits
- Enable/disable options trading
- Enable/disable cryptocurrency
- Trading hours restrictions (market hours only or 24/7)

### UI/UX
- Modern design combining Yahoo Fantasy Sports and Robinhood aesthetics
- Real-time portfolio value charts
- Color-coded gains/losses
- Intuitive search and trade interface
- Mobile-first responsive design

## 📋 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Beautiful, responsive charts
- **Lucide Icons**: Modern icon library
- **Axios**: HTTP client for API calls

### Backend
- **Node.js + Express**: RESTful API server
- **SQLite**: Lightweight, file-based database (easily scalable to PostgreSQL)
- **JWT**: Secure authentication
- **WebSocket**: Real-time updates
- **Bcrypt**: Password hashing

### Market Data APIs
- **Alpha Vantage** (Free tier: 5 calls/min, 500/day)
- Easily configurable for:
  - Finnhub
  - IEX Cloud
  - Polygon.io
  - Yahoo Finance

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- (Optional) Alpha Vantage API key - get free at https://www.alphavantage.co/support/#api-key

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:
```env
PORT=5000
JWT_SECRET=your-super-secret-key-here
ALPHA_VANTAGE_API_KEY=your-api-key-here
```

5. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🔌 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Market Data

#### Get Stock Quote
```http
GET /api/market/quote/:symbol
```

#### Search Stocks
```http
GET /api/market/search?q=apple
```

#### Batch Quotes
```http
POST /api/market/batch-quotes
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

### Leagues

#### Create League
```http
POST /api/leagues
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Family Trading League",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "startingCash": 100000,
  "maxPositionSize": 0.2,
  "allowOptions": false,
  "allowCrypto": false,
  "tradingHours": "Market Hours Only"
}
```

#### Get My Leagues
```http
GET /api/leagues
Authorization: Bearer {token}
```

#### Join League
```http
POST /api/leagues/join/:inviteCode
Authorization: Bearer {token}
```

#### Get Leaderboard
```http
GET /api/leaderboard/:leagueId
Authorization: Bearer {token}
```

### Portfolio & Trading

#### Get Portfolio
```http
GET /api/portfolio/:leagueId
Authorization: Bearer {token}
```

#### Place Trade
```http
POST /api/trade
Authorization: Bearer {token}
Content-Type: application/json

{
  "leagueId": 1,
  "symbol": "AAPL",
  "type": "BUY",
  "shares": 10,
  "price": 185.92
}
```

#### Get Transaction History
```http
GET /api/transactions/:leagueId
Authorization: Bearer {token}
```

## 📊 Database Schema

### Users
- id, email, password (hashed), name, created_at

### Leagues
- id, name, commissioner_id, start_date, end_date, starting_cash
- max_position_size, allow_options, allow_crypto, trading_hours
- invite_code, created_at

### League Members
- id, league_id, user_id, joined_at

### Portfolios
- id, user_id, league_id, cash, created_at

### Holdings
- id, portfolio_id, symbol, shares, avg_price, acquired_at

### Transactions
- id, portfolio_id, symbol, transaction_type, shares, price
- total_amount, executed_at

## 🚀 Deployment

### Backend Deployment (e.g., Railway, Fly.io, Heroku)

1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Database will be created automatically

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the production bundle:
```bash
cd client
npm run build
```

2. Deploy the `build` directory to your hosting platform
3. Set the API URL environment variable to point to your backend

### Recommended Hosting Platforms
- **Backend**: Railway, Fly.io, Render, Heroku
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Upgrade to PostgreSQL on Railway/Render for production scale

## 🔧 Configuration Options

### Upgrading Market Data APIs

The app currently uses Alpha Vantage but can easily be upgraded:

#### Finnhub (Recommended for production)
```javascript
// In server.js MarketDataService class
this.apiKey = process.env.FINNHUB_API_KEY;
this.baseUrl = 'https://finnhub.io/api/v1';
```

#### IEX Cloud
```javascript
this.apiKey = process.env.IEX_CLOUD_API_KEY;
this.baseUrl = 'https://cloud.iexapis.com/stable';
```

#### Polygon.io
```javascript
this.apiKey = process.env.POLYGON_API_KEY;
this.baseUrl = 'https://api.polygon.io/v2';
```

### Database Migration to PostgreSQL

For production scale, migrate from SQLite to PostgreSQL:

1. Install `pg` package:
```bash
npm install pg
```

2. Update database connection in server.js
3. Run migration scripts to transfer data

## 📱 Mobile App Development

The codebase is React-based and can be converted to React Native for native mobile apps:

```bash
npx react-native init InvestLeagueMobile
# Copy components and adapt for React Native
```

## 🔐 Security Best Practices

1. **Change JWT_SECRET** in production
2. Use **HTTPS** for all API calls
3. Implement **rate limiting** on API endpoints
4. Add **input validation** for all user inputs
5. Enable **CORS** only for trusted domains
6. Regular **security audits** and dependency updates

## 📈 Scaling Considerations

### For 100+ Users
- ✅ Current setup works well

### For 1,000+ Users
- Migrate to PostgreSQL
- Add Redis for caching
- Implement CDN for static assets
- Use premium API tier (Finnhub Pro, IEX Cloud)

### For 10,000+ Users
- Microservices architecture
- Load balancing
- Database replication
- Message queue for trades (RabbitMQ/Kafka)
- Separate WebSocket server cluster

## 🤝 Contributing

This is a private project, but contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support & Troubleshooting

### Common Issues

**"Database locked" error**
- SQLite issue with concurrent writes
- Solution: Migrate to PostgreSQL or add retry logic

**"Too many API requests"**
- Free API tier limit reached
- Solution: Implement caching or upgrade to paid tier

**Real-time updates not working**
- WebSocket connection issue
- Solution: Check firewall/proxy settings

**Market data not loading**
- API key issue or rate limit
- Solution: Check API key, use mock data for development

## 📞 Contact

Created by Ryan Foss
- Portfolio: https://iamryanfoss.com
- For issues, create a GitHub issue or contact directly

---

**Built with ❤️ for fantasy stock market enthusiasts**

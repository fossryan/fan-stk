# Project Structure

```
fantasy-investment-app/
│
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   ├── manifest.json
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Portfolio/
│   │   │   ├── Trading/
│   │   │   ├── Leaderboard/
│   │   │   └── League/
│   │   │
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   │
│   │   ├── utils/
│   │   │   ├── formatting.js
│   │   │   └── validation.js
│   │   │
│   │   ├── App.jsx                 # Main application component
│   │   ├── index.js                # Entry point
│   │   └── index.css               # Global styles with Tailwind
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          # Node.js Backend
│   ├── models/                      # Database models (if using ORM)
│   ├── routes/                      # API route handlers
│   ├── middleware/                  # Custom middleware
│   ├── services/
│   │   ├── marketData.js
│   │   └── websocket.js
│   │
│   ├── server.js                    # Main server file
│   ├── package.json
│   ├── .env.example                 # Environment template
│   └── .env                         # Your environment vars (git-ignored)
│
├── docs/                            # Documentation
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── ARCHITECTURE.md              # System architecture
│
├── tests/                           # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                         # Utility scripts
│   ├── seed-data.js                 # Database seeding
│   └── migrate.js                   # Database migrations
│
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── setup.sh                         # Quick setup script
└── README.md                        # Main documentation
```

## Key Files Explained

### Frontend (client/)

**App.jsx**
- Main React component with all views
- Navigation system
- State management
- View routing (Dashboard, Portfolio, Leagues, Leaderboard, Trade)

**services/api.js**
- Centralized API communication
- Authentication handling
- Market data fetching
- WebSocket management
- Utility functions for formatting

**index.css**
- Tailwind CSS imports
- Global styles
- Custom CSS overrides

### Backend (server/)

**server.js**
- Express server setup
- Database initialization
- API routes
- Authentication middleware
- Market data service
- WebSocket server
- Error handling

**Database Schema**
- users: User accounts
- leagues: Competition leagues
- league_members: User-league relationships
- portfolios: User portfolios per league
- holdings: Stock positions
- transactions: Trade history

### Configuration Files

**.env**
- Environment variables
- API keys
- Database configuration
- JWT secret

**package.json** (both client & server)
- Dependencies
- Scripts
- Project metadata

**tailwind.config.js**
- Tailwind CSS configuration
- Custom theme colors
- Content paths

**docker-compose.yml**
- Multi-container setup
- Database services
- Development environment

## Data Flow

### User Authentication
1. User submits login/register form
2. Frontend sends request to /api/auth/*
3. Backend validates credentials
4. JWT token generated and returned
5. Token stored in localStorage
6. Token included in subsequent requests

### Trading Flow
1. User searches for stock symbol
2. Frontend calls /api/market/search
3. User selects stock and enters quantity
4. Frontend validates trade locally
5. Trade submitted to /api/trade
6. Backend validates against portfolio
7. Database updated (portfolio, holdings, transactions)
8. Success response returned
9. Frontend refreshes portfolio

### Real-time Market Data
1. Frontend subscribes to symbols via WebSocket
2. Backend polls market data API
3. Updates broadcast to all connected clients
4. Frontend updates UI with new prices
5. Portfolio values recalculated

### Leaderboard Updates
1. Frontend requests /api/leaderboard/:leagueId
2. Backend fetches all portfolios in league
3. Current market prices fetched for all holdings
4. Total values calculated
5. Rankings sorted by total value
6. Results returned to frontend

## Security Measures

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **SQL Injection Prevention**: Parameterized queries
4. **CORS Protection**: Configured allowed origins
5. **Rate Limiting**: API call limits (to be implemented)
6. **Input Validation**: Server-side validation
7. **HTTPS**: SSL/TLS in production

## Scaling Architecture

### Current (0-100 users)
```
[Frontend] → [Backend + SQLite]
             ↓
          [Market API]
```

### Medium Scale (100-1000 users)
```
[Frontend] → [Load Balancer] → [Backend Servers]
                                 ↓
                              [PostgreSQL]
                                 ↓
                              [Redis Cache]
                                 ↓
                              [Market API]
```

### Large Scale (1000+ users)
```
[Frontend] → [CDN]
             ↓
          [Load Balancer]
             ↓
       [API Gateway]
             ↓
    [Microservices Cluster]
    ├── Auth Service
    ├── Trading Service
    ├── Market Data Service
    └── Portfolio Service
             ↓
    [Database Cluster]
    ├── PostgreSQL (Master/Replica)
    ├── Redis Cache
    └── Message Queue
             ↓
    [External Services]
    ├── Premium Market Data API
    ├── Email Service
    └── Analytics
```

## Development Workflow

1. **Local Development**
   - Run backend: `cd server && npm run dev`
   - Run frontend: `cd client && npm start`
   - Use mock data for testing

2. **Testing**
   - Unit tests: `npm test`
   - Integration tests: Test API endpoints
   - E2E tests: Test user workflows

3. **Building for Production**
   - Build frontend: `cd client && npm run build`
   - Deploy backend with production .env
   - Use production database (PostgreSQL)

4. **Deployment**
   - Push to Git repository
   - Automatic deployment via Railway/Vercel
   - Or manual deployment via Docker

## API Endpoints Summary

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Market Data
- GET /api/market/quote/:symbol
- GET /api/market/search?q=query
- POST /api/market/batch-quotes

### Leagues
- POST /api/leagues
- GET /api/leagues
- GET /api/leagues/:id
- POST /api/leagues/join/:inviteCode
- GET /api/leaderboard/:leagueId

### Portfolio
- GET /api/portfolio/:leagueId
- GET /api/transactions/:leagueId

### Trading
- POST /api/trade

## Future Enhancements

### Phase 1 (MVP - Current)
- ✅ User authentication
- ✅ League creation and management
- ✅ Real-time market data
- ✅ Trading functionality
- ✅ Leaderboards
- ✅ Portfolio tracking

### Phase 2 (Enhanced)
- [ ] Email invite system
- [ ] Push notifications
- [ ] Advanced charting
- [ ] Multiple asset types (options, crypto)
- [ ] Social features (comments, chat)
- [ ] Mobile app (React Native)

### Phase 3 (Advanced)
- [ ] Paper trading mode
- [ ] Historical performance analytics
- [ ] AI-powered insights
- [ ] Tournament mode
- [ ] Achievements and badges
- [ ] Premium subscription features

### Phase 4 (Enterprise)
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] Advanced risk analytics
- [ ] Regulatory compliance features
- [ ] Multi-currency support
- [ ] Institutional features

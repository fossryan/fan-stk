const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const db = new sqlite3.Database('./investleague.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize Database Schema
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Leagues table
    db.run(`CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      commissioner_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      starting_cash DECIMAL(15,2) NOT NULL,
      max_position_size DECIMAL(3,2),
      allow_options BOOLEAN DEFAULT 0,
      allow_crypto BOOLEAN DEFAULT 0,
      trading_hours TEXT,
      invite_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (commissioner_id) REFERENCES users(id)
    )`);

    // League Members table
    db.run(`CREATE TABLE IF NOT EXISTS league_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(league_id, user_id)
    )`);

    // Portfolios table
    db.run(`CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      league_id INTEGER NOT NULL,
      cash DECIMAL(15,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      UNIQUE(user_id, league_id)
    )`);

    // Holdings table
    db.run(`CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      shares DECIMAL(15,4) NOT NULL,
      avg_price DECIMAL(15,2) NOT NULL,
      acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      shares DECIMAL(15,4) NOT NULL,
      price DECIMAL(15,2) NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
    )`);

    console.log('Database initialized successfully');
  });
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Market Data Service
class MarketDataService {
  constructor() {
    // Using Alpha Vantage as primary (free tier: 5 calls/min, 500 calls/day)
    // Alternative: Finnhub, IEX Cloud, Yahoo Finance API
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute cache
  }

  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        }
      });

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data available for symbol');
      }

      const data = {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open'])
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      
      // Fallback to mock data for demo purposes
      return this.getMockQuote(symbol);
    }
  }

  async searchSymbols(query) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey
        }
      });

      const matches = response.data.bestMatches || [];
      return matches.slice(0, 10).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
    } catch (error) {
      console.error(`Error searching symbols:`, error.message);
      return this.getMockSearchResults(query);
    }
  }

  async getBatchQuotes(symbols) {
    const quotes = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol))
    );
    return quotes;
  }

  // Mock data for demo/development
  getMockQuote(symbol) {
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol: symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      latestTradingDay: new Date().toISOString().split('T')[0],
      previousClose: parseFloat((basePrice - change).toFixed(2)),
      high: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      open: parseFloat((basePrice + (Math.random() - 0.5) * 3).toFixed(2))
    };
  }

  getMockSearchResults(query) {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States', currency: 'USD' }
    ];
    
    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

const marketData = new MarketDataService();

// ============ API ROUTES ============

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
          token,
          user: { id: this.lastID, email, name }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  });
});

// Market Data Routes
app.get('/api/market/quote/:symbol', async (req, res) => {
  try {
    const quote = await marketData.getQuote(req.params.symbol.toUpperCase());
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

app.get('/api/market/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const results = await marketData.searchSymbols(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.post('/api/market/batch-quotes', async (req, res) => {
  const { symbols } = req.body;
  if (!symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ error: 'Symbols array required' });
  }

  try {
    const quotes = await marketData.getBatchQuotes(symbols);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// League Routes
app.post('/api/leagues', authenticateToken, (req, res) => {
  const {
    name,
    startDate,
    endDate,
    startingCash,
    maxPositionSize,
    allowOptions,
    allowCrypto,
    tradingHours
  } = req.body;

  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  db.run(
    `INSERT INTO leagues (name, commissioner_id, start_date, end_date, starting_cash, 
     max_position_size, allow_options, allow_crypto, trading_hours, invite_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, req.user.id, startDate, endDate, startingCash, maxPositionSize || 0.2,
     allowOptions ? 1 : 0, allowCrypto ? 1 : 0, tradingHours || 'Market Hours', inviteCode],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create league' });
      }

      // Add commissioner as first member
      const leagueId = this.lastID;
      db.run(
        'INSERT INTO league_members (league_id, user_id) VALUES (?, ?)',
        [leagueId, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to add commissioner' });
          }

          // Create initial portfolio
          db.run(
            'INSERT INTO portfolios (user_id, league_id, cash) VALUES (?, ?, ?)',
            [req.user.id, leagueId, startingCash],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to create portfolio' });
              }

              res.status(201).json({
                id: leagueId,
                name,
                inviteCode,
                message: 'League created successfully'
              });
            }
          );
        }
      );
    }
  );
});

app.get('/api/leagues', authenticateToken, (req, res) => {
  db.all(
    `SELECT l.*, u.name as commissioner_name,
     (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
     FROM leagues l
     JOIN users u ON l.commissioner_id = u.id
     JOIN league_members lm ON l.id = lm.league_id
     WHERE lm.user_id = ?`,
    [req.user.id],
    (err, leagues) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch leagues' });
      }
      res.json(leagues);
    }
  );
});

app.get('/api/leagues/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT l.*, u.name as commissioner_name
     FROM leagues l
     JOIN users u ON l.commissioner_id = u.id
     WHERE l.id = ?`,
    [req.params.id],
    (err, league) => {
      if (err || !league) {
        return res.status(404).json({ error: 'League not found' });
      }

      // Check if user is member
      db.get(
        'SELECT * FROM league_members WHERE league_id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        (err, membership) => {
          if (err || !membership) {
            return res.status(403).json({ error: 'Not a league member' });
          }
          res.json(league);
        }
      );
    }
  );
});

app.post('/api/leagues/join/:inviteCode', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM leagues WHERE invite_code = ?',
    [req.params.inviteCode],
    (err, league) => {
      if (err || !league) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      // Check if already a member
      db.get(
        'SELECT * FROM league_members WHERE league_id = ? AND user_id = ?',
        [league.id, req.user.id],
        (err, existing) => {
          if (existing) {
            return res.status(400).json({ error: 'Already a member' });
          }

          // Add member
          db.run(
            'INSERT INTO league_members (league_id, user_id) VALUES (?, ?)',
            [league.id, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to join league' });
              }

              // Create portfolio
              db.run(
                'INSERT INTO portfolios (user_id, league_id, cash) VALUES (?, ?, ?)',
                [req.user.id, league.id, league.starting_cash],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to create portfolio' });
                  }
                  res.json({ message: 'Successfully joined league', league });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Portfolio Routes
app.get('/api/portfolio/:leagueId', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM portfolios WHERE user_id = ? AND league_id = ?',
    [req.user.id, req.params.leagueId],
    (err, portfolio) => {
      if (err || !portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      db.all(
        'SELECT * FROM holdings WHERE portfolio_id = ?',
        [portfolio.id],
        async (err, holdings) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch holdings' });
          }

          // Get current prices for all holdings
          const symbols = holdings.map(h => h.symbol);
          let enrichedHoldings = [];
          
          if (symbols.length > 0) {
            try {
              const quotes = await marketData.getBatchQuotes(symbols);
              enrichedHoldings = holdings.map((holding, index) => ({
                ...holding,
                currentPrice: quotes[index].price,
                value: quotes[index].price * holding.shares,
                gainLoss: (quotes[index].price - holding.avg_price) * holding.shares,
                gainLossPercent: ((quotes[index].price - holding.avg_price) / holding.avg_price) * 100
              }));
            } catch (error) {
              console.error('Error enriching holdings:', error);
            }
          }

          const totalValue = portfolio.cash + enrichedHoldings.reduce((sum, h) => sum + h.value, 0);

          res.json({
            ...portfolio,
            holdings: enrichedHoldings,
            totalValue
          });
        }
      );
    }
  );
});

// Trading Routes
app.post('/api/trade', authenticateToken, async (req, res) => {
  const { leagueId, symbol, type, shares, price } = req.body;

  if (!leagueId || !symbol || !type || !shares || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get portfolio
  db.get(
    'SELECT * FROM portfolios WHERE user_id = ? AND league_id = ?',
    [req.user.id, leagueId],
    async (err, portfolio) => {
      if (err || !portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      const totalCost = shares * price;

      if (type === 'BUY') {
        // Check if enough cash
        if (portfolio.cash < totalCost) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Update or create holding
        db.get(
          'SELECT * FROM holdings WHERE portfolio_id = ? AND symbol = ?',
          [portfolio.id, symbol],
          (err, holding) => {
            if (holding) {
              // Update existing holding
              const newShares = parseFloat(holding.shares) + parseFloat(shares);
              const newAvgPrice = ((holding.avg_price * holding.shares) + totalCost) / newShares;

              db.run(
                'UPDATE holdings SET shares = ?, avg_price = ? WHERE id = ?',
                [newShares, newAvgPrice, holding.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update holding' });
                  }
                  completeTrade();
                }
              );
            } else {
              // Create new holding
              db.run(
                'INSERT INTO holdings (portfolio_id, symbol, shares, avg_price) VALUES (?, ?, ?, ?)',
                [portfolio.id, symbol, shares, price],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to create holding' });
                  }
                  completeTrade();
                }
              );
            }
          }
        );

        function completeTrade() {
          // Update cash
          db.run(
            'UPDATE portfolios SET cash = cash - ? WHERE id = ?',
            [totalCost, portfolio.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to update cash' });
              }

              // Record transaction
              db.run(
                `INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, total_amount)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [portfolio.id, symbol, type, shares, price, totalCost],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to record transaction' });
                  }
                  res.json({ message: 'Trade executed successfully' });
                }
              );
            }
          );
        }
      } else if (type === 'SELL') {
        // Check if holding exists and has enough shares
        db.get(
          'SELECT * FROM holdings WHERE portfolio_id = ? AND symbol = ?',
          [portfolio.id, symbol],
          (err, holding) => {
            if (err || !holding) {
              return res.status(404).json({ error: 'Holding not found' });
            }

            if (holding.shares < shares) {
              return res.status(400).json({ error: 'Insufficient shares' });
            }

            const newShares = holding.shares - shares;

            if (newShares === 0) {
              // Remove holding
              db.run('DELETE FROM holdings WHERE id = ?', [holding.id], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to remove holding' });
                }
                completeSellTrade();
              });
            } else {
              // Update holding
              db.run(
                'UPDATE holdings SET shares = ? WHERE id = ?',
                [newShares, holding.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update holding' });
                  }
                  completeSellTrade();
                }
              );
            }

            function completeSellTrade() {
              // Update cash
              db.run(
                'UPDATE portfolios SET cash = cash + ? WHERE id = ?',
                [totalCost, portfolio.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update cash' });
                  }

                  // Record transaction
                  db.run(
                    `INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, total_amount)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [portfolio.id, symbol, type, shares, price, totalCost],
                    (err) => {
                      if (err) {
                        return res.status(500).json({ error: 'Failed to record transaction' });
                      }
                      res.json({ message: 'Trade executed successfully' });
                    }
                  );
                }
              );
            }
          }
        );
      }
    }
  );
});

// Leaderboard Route
app.get('/api/leaderboard/:leagueId', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.name, u.email,
     (SELECT COUNT(*) FROM holdings WHERE portfolio_id = p.id) as holdings_count
     FROM portfolios p
     JOIN users u ON p.user_id = u.id
     WHERE p.league_id = ?`,
    [req.params.leagueId],
    async (err, portfolios) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch leaderboard' });
      }

      // Calculate total value for each portfolio
      const leaderboardData = await Promise.all(
        portfolios.map(async (portfolio) => {
          const holdings = await new Promise((resolve, reject) => {
            db.all(
              'SELECT * FROM holdings WHERE portfolio_id = ?',
              [portfolio.id],
              (err, holdings) => {
                if (err) reject(err);
                else resolve(holdings);
              }
            );
          });

          let holdingsValue = 0;
          if (holdings.length > 0) {
            try {
              const symbols = holdings.map(h => h.symbol);
              const quotes = await marketData.getBatchQuotes(symbols);
              holdingsValue = holdings.reduce((sum, holding, index) => {
                return sum + (quotes[index].price * holding.shares);
              }, 0);
            } catch (error) {
              console.error('Error calculating holdings value:', error);
            }
          }

          const totalValue = parseFloat(portfolio.cash) + holdingsValue;

          // Get league starting cash
          const league = await new Promise((resolve, reject) => {
            db.get(
              'SELECT starting_cash FROM leagues WHERE id = ?',
              [req.params.leagueId],
              (err, league) => {
                if (err) reject(err);
                else resolve(league);
              }
            );
          });

          const returnPercent = ((totalValue - league.starting_cash) / league.starting_cash) * 100;

          return {
            userId: portfolio.user_id,
            name: portfolio.user_id === req.user.id ? 'You' : portfolio.name,
            totalValue: totalValue,
            returnPercent: returnPercent,
            cash: portfolio.cash,
            holdingsValue: holdingsValue
          };
        })
      );

      // Sort by total value
      leaderboardData.sort((a, b) => b.totalValue - a.totalValue);

      // Add ranks
      const rankedLeaderboard = leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      res.json(rankedLeaderboard);
    }
  );
});

// Transaction History
app.get('/api/transactions/:leagueId', authenticateToken, (req, res) => {
  db.get(
    'SELECT id FROM portfolios WHERE user_id = ? AND league_id = ?',
    [req.user.id, req.params.leagueId],
    (err, portfolio) => {
      if (err || !portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      db.all(
        'SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY executed_at DESC LIMIT 50',
        [portfolio.id],
        (err, transactions) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch transactions' });
          }
          res.json(transactions);
        }
      );
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Market data service initialized`);
  console.log(`🗄️  Database connected`);
});

// WebSocket Setup for Real-time Updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe' && data.symbols) {
        // Send real-time updates for subscribed symbols
        const interval = setInterval(async () => {
          try {
            const quotes = await marketData.getBatchQuotes(data.symbols);
            ws.send(JSON.stringify({ type: 'quotes', data: quotes }));
          } catch (error) {
            console.error('Error sending quotes:', error);
          }
        }, 5000); // Update every 5 seconds

        ws.on('close', () => {
          clearInterval(interval);
          console.log('WebSocket connection closed');
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
});

module.exports = app;

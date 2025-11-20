import axios from 'axios';

// Configure API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Market Data Services
export const marketService = {
  getQuote: async (symbol) => {
    const response = await api.get(`/market/quote/${symbol}`);
    return response.data;
  },

  searchSymbols: async (query) => {
    const response = await api.get(`/market/search?q=${query}`);
    return response.data;
  },

  getBatchQuotes: async (symbols) => {
    const response = await api.post('/market/batch-quotes', { symbols });
    return response.data;
  },
};

// League Services
export const leagueService = {
  createLeague: async (leagueData) => {
    const response = await api.post('/leagues', leagueData);
    return response.data;
  },

  getMyLeagues: async () => {
    const response = await api.get('/leagues');
    return response.data;
  },

  getLeague: async (leagueId) => {
    const response = await api.get(`/leagues/${leagueId}`);
    return response.data;
  },

  joinLeague: async (inviteCode) => {
    const response = await api.post(`/leagues/join/${inviteCode}`);
    return response.data;
  },

  getLeaderboard: async (leagueId) => {
    const response = await api.get(`/leaderboard/${leagueId}`);
    return response.data;
  },
};

// Portfolio Services
export const portfolioService = {
  getPortfolio: async (leagueId) => {
    const response = await api.get(`/portfolio/${leagueId}`);
    return response.data;
  },

  getTransactions: async (leagueId) => {
    const response = await api.get(`/transactions/${leagueId}`);
    return response.data;
  },
};

// Trading Services
export const tradingService = {
  executeTrade: async (tradeData) => {
    const response = await api.post('/trade', tradeData);
    return response.data;
  },

  validateTrade: async (tradeData) => {
    // Client-side validation before sending to server
    const { leagueId, symbol, type, shares, price } = tradeData;

    if (!symbol || symbol.length === 0) {
      throw new Error('Stock symbol is required');
    }

    if (!shares || shares <= 0) {
      throw new Error('Shares must be greater than 0');
    }

    if (!price || price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Get current portfolio to validate against cash/holdings
    const portfolio = await portfolioService.getPortfolio(leagueId);

    if (type === 'BUY') {
      const totalCost = shares * price;
      if (totalCost > portfolio.cash) {
        throw new Error('Insufficient funds for this purchase');
      }
    } else if (type === 'SELL') {
      const holding = portfolio.holdings.find(h => h.symbol === symbol);
      if (!holding) {
        throw new Error(`You don't own any shares of ${symbol}`);
      }
      if (holding.shares < shares) {
        throw new Error(`You only own ${holding.shares} shares of ${symbol}`);
      }
    }

    return true;
  },
};

// WebSocket Service for Real-time Updates
export class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifySubscribers(data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(symbols, callback) {
    const id = Math.random().toString(36).substr(2, 9);
    this.subscribers.set(id, { symbols, callback });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbols }));
    }

    return id;
  }

  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(({ symbols, callback }) => {
      if (data.type === 'quotes') {
        callback(data.data);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Utility Functions
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateReturn = (currentValue, initialValue) => {
  if (initialValue === 0) return 0;
  return ((currentValue - initialValue) / initialValue) * 100;
};

export const calculatePortfolioStats = (portfolio) => {
  const totalValue = portfolio.cash + portfolio.holdings.reduce((sum, h) => sum + h.value, 0);
  const invested = portfolio.holdings.reduce((sum, h) => sum + (h.shares * h.avg_price), 0);
  const totalGainLoss = portfolio.holdings.reduce((sum, h) => sum + h.gainLoss, 0);
  const totalGainLossPercent = invested > 0 ? (totalGainLoss / invested) * 100 : 0;

  return {
    totalValue,
    invested,
    cash: portfolio.cash,
    totalGainLoss,
    totalGainLossPercent,
    cashPercent: (portfolio.cash / totalValue) * 100,
    investedPercent: (invested / totalValue) * 100,
  };
};

export default api;

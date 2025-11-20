import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Trophy, Calendar, Plus, Search, Menu, X, LogOut, Settings, Share2, Mail } from 'lucide-react';

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [leagues, setLeagues] = useState([]);
  const [activeLeague, setActiveLeague] = useState(null);
  const [portfolio, setPortfolio] = useState({ holdings: [], cash: 100000, totalValue: 100000 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Simulated login - in production, this would connect to your backend
  useEffect(() => {
    const mockUser = {
      id: 1,
      name: 'Ryan Foss',
      email: 'ryan@example.com',
      avatar: '👨‍💼'
    };
    setUser(mockUser);
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock leagues
    setLeagues([
      {
        id: 1,
        name: 'Family Trading League',
        commissioner: 'Ryan Foss',
        members: 8,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        startingCash: 100000,
        rules: {
          maxPositionSize: 0.2,
          allowOptions: false,
          allowCrypto: false,
          tradingHours: 'Market Hours Only'
        }
      },
      {
        id: 2,
        name: 'Friends Investment Challenge',
        commissioner: 'You',
        members: 5,
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        startingCash: 50000,
        rules: {
          maxPositionSize: 0.3,
          allowOptions: true,
          allowCrypto: true,
          tradingHours: '24/7'
        }
      }
    ]);

    // Mock portfolio
    setPortfolio({
      cash: 45230.50,
      holdings: [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, avgPrice: 178.25, currentPrice: 185.92, value: 9296 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 30, avgPrice: 378.50, currentPrice: 392.18, value: 11765.40 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 75, avgPrice: 138.90, currentPrice: 142.35, value: 10676.25 },
        { symbol: 'TSLA', name: 'Tesla Inc.', shares: 40, avgPrice: 245.30, currentPrice: 238.75, value: 9550 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 25, avgPrice: 485.20, currentPrice: 512.80, value: 12820 }
      ],
      totalValue: 99338.15,
      dayChange: 1245.80,
      dayChangePercent: 1.27
    });

    // Mock leaderboard
    setLeaderboard([
      { rank: 1, name: 'Sarah Chen', value: 125430.20, change: 25.43, avatar: '👩‍💼' },
      { rank: 2, name: 'Mike Johnson', value: 118920.50, change: 18.92, avatar: '👨‍💼' },
      { rank: 3, name: 'You', value: 99338.15, change: -0.66, avatar: '👨‍💼' },
      { rank: 4, name: 'Emily Davis', value: 96540.75, change: -3.46, avatar: '👩‍💼' },
      { rank: 5, name: 'James Wilson', value: 92180.30, change: -7.82, avatar: '👨‍💼' }
    ]);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    // Mock search results - in production, call your API
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 2.45 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: -1.20 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 156.78, change: 3.85 }
    ].filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(mockResults);
  };

  // Auth Components
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📈</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">InvestLeague</h1>
          <p className="text-gray-600">Compete with friends in fantasy investing</p>
        </div>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={() => setUser({ name: 'Ryan Foss' })}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Sign In
          </button>
          <div className="text-center">
            <button className="text-green-600 hover:text-green-700 text-sm">
              Don't have an account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation
  const Navigation = () => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-green-600">📈 InvestLeague</div>
            <div className="hidden md:flex space-x-1">
              <NavButton label="Dashboard" view="dashboard" />
              <NavButton label="Portfolio" view="portfolio" />
              <NavButton label="Leagues" view="leagues" />
              <NavButton label="Leaderboard" view="leaderboard" />
              <NavButton label="Trade" view="trade" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <MobileNavButton label="Dashboard" view="dashboard" />
            <MobileNavButton label="Portfolio" view="portfolio" />
            <MobileNavButton label="Leagues" view="leagues" />
            <MobileNavButton label="Leaderboard" view="leaderboard" />
            <MobileNavButton label="Trade" view="trade" />
          </div>
        </div>
      )}
    </nav>
  );

  const NavButton = ({ label, view }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        currentView === view
          ? 'bg-green-50 text-green-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const MobileNavButton = ({ label, view }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setShowMobileMenu(false);
      }}
      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
        currentView === view
          ? 'bg-green-50 text-green-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  // Dashboard View
  const Dashboard = () => {
    const mockChartData = [
      { date: 'Jan', value: 100000 },
      { date: 'Feb', value: 102500 },
      { date: 'Mar', value: 98000 },
      { date: 'Apr', value: 104500 },
      { date: 'May', value: 108200 },
      { date: 'Jun', value: 99338 }
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Summary */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Portfolio Value</p>
              <h2 className="text-4xl font-bold">${portfolio.totalValue.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <div className={`flex items-center justify-end space-x-1 ${portfolio.dayChange >= 0 ? 'text-green-100' : 'text-red-200'}`}>
                {portfolio.dayChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span className="text-xl font-semibold">
                  ${Math.abs(portfolio.dayChange).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-green-100">
                {portfolio.dayChangePercent >= 0 ? '+' : ''}{portfolio.dayChangePercent}% today
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-green-100 text-sm">Cash Available</p>
              <p className="text-xl font-semibold">${portfolio.cash.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-green-100 text-sm">Invested</p>
              <p className="text-xl font-semibold">
                ${(portfolio.totalValue - portfolio.cash).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Trophy className="h-6 w-6 text-yellow-500" />}
            title="League Rank"
            value="#3"
            subtitle="of 8 players"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-blue-500" />}
            title="Active Leagues"
            value="2"
            subtitle="Competing"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-purple-500" />}
            title="Days Left"
            value="184"
            subtitle="In current season"
          />
        </div>

        {/* Top Holdings */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Holdings</h3>
          <div className="space-y-3">
            {portfolio.holdings.slice(0, 3).map((holding) => {
              const gainLoss = (holding.currentPrice - holding.avgPrice) * holding.shares;
              const gainLossPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
              return (
                <div key={holding.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{holding.symbol}</p>
                    <p className="text-sm text-gray-600">{holding.shares} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${holding.value.toLocaleString()}</p>
                    <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  // Portfolio View
  const Portfolio = () => (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Portfolio</h2>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Trade</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {portfolio.holdings.map((holding) => {
                const gainLoss = (holding.currentPrice - holding.avgPrice) * holding.shares;
                const gainLossPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                return (
                  <tr key={holding.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{holding.symbol}</p>
                        <p className="text-sm text-gray-500">{holding.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{holding.shares}</td>
                    <td className="px-6 py-4 text-gray-900">${holding.avgPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-900">${holding.currentPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${holding.value.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <p className="font-semibold">{gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}</p>
                        <p className="text-sm">{gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Leaderboard View
  const Leaderboard = () => (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">League Leaderboard</h2>
        <p className="text-gray-600">Family Trading League</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player) => (
          <div
            key={player.rank}
            className={`bg-white rounded-xl shadow p-6 flex items-center justify-between ${
              player.name === 'You' ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center ${
                player.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                player.rank === 2 ? 'bg-gray-100 text-gray-600' :
                player.rank === 3 ? 'bg-orange-100 text-orange-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
              </div>
              <div>
                <p className="font-semibold text-lg">{player.name}</p>
                <p className="text-sm text-gray-600">${player.value.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${player.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {player.change >= 0 ? '+' : ''}{player.change}%
              </p>
              <p className="text-sm text-gray-500">Total Return</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Leagues View
  const Leagues = () => (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leagues</h2>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create League</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leagues.map((league) => (
          <div key={league.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{league.name}</h3>
                <p className="text-sm text-gray-600">Commissioner: {league.commissioner}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Members</span>
                <span className="font-semibold">{league.members} players</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Starting Cash</span>
                <span className="font-semibold">${league.startingCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Season</span>
                <span className="font-semibold">{league.startDate} to {league.endDate}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">League Rules:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  Max Position: {league.rules.maxPositionSize * 100}%
                </span>
                <span className={`px-2 py-1 text-xs rounded ${league.rules.allowOptions ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {league.rules.allowOptions ? '✓' : '✗'} Options
                </span>
                <span className={`px-2 py-1 text-xs rounded ${league.rules.allowCrypto ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {league.rules.allowCrypto ? '✓' : '✗'} Crypto
                </span>
              </div>
            </div>

            <button className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold">
              View League
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Trade View
  const Trade = () => {
    const [tradeType, setTradeType] = useState('buy');
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState('');

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold">Place Trade</h2>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tradeType === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tradeType === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
              <input
                type="text"
                placeholder="AAPL, MSFT, GOOGL..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg divide-y">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 hover:bg-gray-50 text-left flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${stock.price}</p>
                        <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStock && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{selectedStock.symbol}</p>
                    <p className="text-sm text-gray-600">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${selectedStock.price}</p>
                    <p className={`text-sm ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Number of shares"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {selectedStock && quantity && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Estimated Total</span>
                  <span className="font-semibold text-lg">
                    ${(selectedStock.price * parseFloat(quantity)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Available Cash</span>
                  <span>${portfolio.cash.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                tradeType === 'buy'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {tradeType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Trades execute at market price. League rules apply to all transactions.
          </p>
        </div>
      </div>
    );
  };

  // Main Render
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'portfolio' && <Portfolio />}
      {currentView === 'leaderboard' && <Leaderboard />}
      {currentView === 'leagues' && <Leagues />}
      {currentView === 'trade' && <Trade />}
    </div>
  );
};

export default App;

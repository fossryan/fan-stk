#!/bin/bash

echo "🚀 InvestLeague - Quick Start Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd server

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env and add your API keys!"
fi

echo "📥 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend setup complete!"
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../client

echo "📥 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend setup complete!"
echo ""

# Done
cd ..

echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit server/.env and add your Alpha Vantage API key"
echo "   Get free key: https://www.alphavantage.co/support/#api-key"
echo ""
echo "2. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd client && npm start"
echo ""
echo "4. Open your browser to http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
echo ""

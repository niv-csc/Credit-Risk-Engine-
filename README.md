# 🏦 Behavioural Credit Risk Engine

A real-time credit risk assessment system that predicts customer default probability using transaction patterns.

## ✨ Features

- **Real-time Risk Scoring**: Dynamic risk calculation based on transaction behavior
- **Interactive Dashboard**: View all customers with color-coded risk levels
- **Explainable AI**: See why each customer is flagged as high/medium/low risk
- **Transaction Simulation**: Add transactions and watch risk scores update instantly
- **Professional UI**: Built with Material UI and Recharts

## 🚀 Live Demo

[View Live Demo](https://risk-prototype.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React, Material UI, Recharts, Axios
- **Backend**: Node.js, Express
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## 🔧 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/risk-prototype.git
   cd risk-prototype
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## 🎯 How It Works

The risk score is calculated using simple rules:

| Factor | Weight | Description |
|--------|--------|-------------|
| Utilization | 30% | Spending vs income ratio |
| Night Transactions | 20% | Transactions between 11 PM - 5 AM |
| Cash Advances | 20% | ATM withdrawals and cash advances |
| Volatility | 15% | Spending pattern stability |
| Small Transactions | 10% | Multiple small transactions (<₹1000) |
| Income Stability | 5% | Regular credit transactions |

## 📊 API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | /api/users | Get all users with risk scores |
| GET | /api/users/:id | Get single user |
| GET | /api/users/:id/transactions | Get user transactions |
| GET | /api/users/:id/risk | Get user risk score |
| POST | /api/users/:id/transactions | Add transaction |
| GET | /api/stats | Get dashboard statistics |
| GET | /api/health | Health check |

## 🚢 Deploy to Vercel

1. Push this code to GitHub
2. Go to vercel.com
3. Import your repository
4. Click "Deploy"

## 📝 License

MIT

## 👨‍💻 Author

Your Name

- GitHub: @YOUR_USERNAME
- LinkedIn: Your Profile

## 🙏 Acknowledgments

- Built as a prototype for demonstrating behavioural credit risk concepts
- Inspired by real-world banking risk systems

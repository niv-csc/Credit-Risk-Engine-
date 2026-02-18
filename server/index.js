const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const data = require('./data');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple rule-based "ML" engine
const calculateRiskScore = (userId) => {
  const user = data.users.find(u => u.id === userId);
  const transactions = data.transactions.filter(t => t.user_id === userId);
  
  if (!user) return null;
  
  // Base score
  let score = 0.5;
  let factors = [];
  
  // Get last 30 days transactions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTxns = transactions.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
  const debitTxns = recentTxns.filter(t => t.type === 'debit');
  
  if (debitTxns.length === 0) {
    return {
      final_score: 0.3,
      risk_category: 'LOW',
      factors: ['No recent spending activity']
    };
  }
  
  // Calculate total spending
  const totalSpent = debitTxns.reduce((sum, t) => sum + t.amount, 0);
  const utilization = totalSpent / user.monthly_income;
  
  // Rule 1: High utilization (>80%)
  if (utilization > 0.8) {
    score += 0.2;
    factors.push({
      factor: 'High credit utilization',
      impact: 0.2,
      description: `Spent ${(utilization * 100).toFixed(0)}% of monthly income` 
    });
  } else if (utilization > 0.5) {
    score += 0.1;
    factors.push({
      factor: 'Moderate utilization',
      impact: 0.1,
      description: `Spent ${(utilization * 100).toFixed(0)}% of monthly income` 
    });
  } else {
    score -= 0.1;
    factors.push({
      factor: 'Low utilization',
      impact: -0.1,
      description: `Healthy spending at ${(utilization * 100).toFixed(0)}% of income` 
    });
  }
  
  // Rule 2: Night transactions (11 PM - 5 AM)
  const nightTxns = debitTxns.filter(t => {
    const hour = new Date(t.timestamp).getHours();
    return hour >= 23 || hour <= 5;
  });
  
  if (nightTxns.length > 3) {
    score += 0.15;
    factors.push({
      factor: 'Frequent night transactions',
      impact: 0.15,
      description: `${nightTxns.length} transactions between 11 PM - 5 AM` 
    });
  } else if (nightTxns.length > 0) {
    score += 0.05;
    factors.push({
      factor: 'Some night activity',
      impact: 0.05,
      description: `${nightTxns.length} night transactions` 
    });
  }
  
  // Rule 3: Cash advances/ATM withdrawals
  const cashTxns = debitTxns.filter(t => 
    t.category === 'atm_withdrawal' || t.category === 'cash_advance'
  );
  
  if (cashTxns.length > 2) {
    score += 0.15;
    factors.push({
      factor: 'Frequent cash advances',
      impact: 0.15,
      description: `${cashTxns.length} ATM/cash withdrawals` 
    });
  } else if (cashTxns.length > 0) {
    score += 0.05;
    factors.push({
      factor: 'Some cash usage',
      impact: 0.05,
      description: `${cashTxns.length} cash transactions` 
    });
  }
  
  // Rule 4: Spending volatility
  if (debitTxns.length > 1) {
    const amounts = debitTxns.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev / mean;
    
    if (volatility > 1.5) {
      score += 0.1;
      factors.push({
        factor: 'High spending volatility',
        impact: 0.1,
        description: 'Spending amounts vary significantly'
      });
    } else if (volatility > 1) {
      score += 0.05;
      factors.push({
        factor: 'Moderate spending volatility',
        impact: 0.05,
        description: 'Spending amounts vary moderately'
      });
    } else {
      score -= 0.05;
      factors.push({
        factor: 'Low spending volatility',
        impact: -0.05,
        description: 'Spending amounts are relatively stable'
      });
    }
  }
  
  // Rule 5: Multiple small transactions (potential stress)
  const smallTxns = debitTxns.filter(t => t.amount < 1000);
  if (smallTxns.length > 10) {
    score += 0.1;
    factors.push({
      factor: 'Many small transactions',
      impact: 0.1,
      description: `${smallTxns.length} small transactions (<₹1000)` 
    });
  }
  
  // Rule 6: Income stability (check regular credits)
  const credits = recentTxns.filter(t => t.type === 'credit');
  if (credits.length === 0) {
    score += 0.1;
    factors.push({
      factor: 'No recent income',
      impact: 0.1,
      description: 'No credit transactions in last 30 days'
    });
  }
  
  // Normalize score to 0-1
  score = Math.max(0, Math.min(1, score));
  
  // Determine category
  let category;
  if (score >= 0.7) category = 'HIGH';
  else if (score >= 0.4) category = 'MEDIUM';
  else category = 'LOW';
  
  // Sort factors by impact
  factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  
  return {
    final_score: score,
    risk_category: category,
    factors: factors.slice(0, 5), // Top 5 factors
    default_probability: score,
    anomaly_score: Math.min(score + 0.1, 1),
    stress_score: Math.min(score * 1.2, 1),
    generated_at: new Date()
  };
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), environment: process.env.NODE_ENV });
});

// Get all users
app.get('/api/users', (req, res) => {
  const usersWithRisk = data.users.map(user => {
    const risk = calculateRiskScore(user.id);
    return {
      ...user,
      risk_score: risk?.final_score,
      risk_category: risk?.risk_category
    };
  });
  res.json(usersWithRisk);
});

// Get single user
app.get('/api/users/:id', (req, res) => {
  const user = data.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Get user transactions
app.get('/api/users/:id/transactions', (req, res) => {
  const transactions = data.transactions
    .filter(t => t.user_id === req.params.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(transactions);
});

// Get user risk score
app.get('/api/users/:id/risk', (req, res) => {
  const risk = calculateRiskScore(req.params.id);
  if (!risk) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(risk);
});

// Add transaction (triggers risk recalculation)
app.post('/api/users/:id/transactions', (req, res) => {
  const { amount, category, type } = req.body;
  const userId = req.params.id;
  
  const newTransaction = {
    id: data.generateId('transactions'),
    user_id: userId,
    amount,
    type,
    category,
    timestamp: new Date()
  };
  
  data.transactions.push(newTransaction);
  
  // Calculate new risk score
  const risk = calculateRiskScore(userId);
  
  res.status(201).json({
    transaction: newTransaction,
    risk: risk
  });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  const stats = {
    total_users: data.users.length,
    total_transactions: data.transactions.length,
    risk_distribution: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  data.users.forEach(user => {
    const risk = calculateRiskScore(user.id);
    if (risk?.risk_category === 'HIGH') stats.risk_distribution.high++;
    else if (risk?.risk_category === 'MEDIUM') stats.risk_distribution.medium++;
    else if (risk?.risk_category === 'LOW') stats.risk_distribution.low++;
  });
  
  res.json(stats);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), environment: process.env.NODE_ENV });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/users/:id`);
  console.log(`   GET  /api/users/:id/transactions`);
  console.log(`   GET  /api/users/:id/risk`);
  console.log(`   POST /api/users/:id/transactions`);
  console.log(`   GET  /api/stats`);
});

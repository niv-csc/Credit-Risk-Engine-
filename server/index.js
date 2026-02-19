const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE (Critical for Vercel) ==========
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// ========== IN-MEMORY DATABASE ==========
const data = {
  users: [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9876543210',
      occupation: 'Software Engineer',
      employer: 'Tech Solutions Ltd',
      monthly_income: 75000,
      credit_limit: 300000,
      created_at: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543211',
      occupation: 'School Teacher',
      employer: 'Delhi Public School',
      monthly_income: 45000,
      credit_limit: 150000,
      created_at: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9876543212',
      occupation: 'Small Business Owner',
      employer: 'Patel & Co',
      monthly_income: 120000,
      credit_limit: 500000,
      created_at: new Date('2024-01-10')
    }
  ],

  transactions: [
    { id: 't1', user_id: '1', amount: 25000, type: 'debit', category: 'shopping', timestamp: new Date('2024-02-15T10:30:00') },
    { id: 't2', user_id: '1', amount: 5000, type: 'debit', category: 'atm_withdrawal', timestamp: new Date('2024-02-16T23:45:00') },
    { id: 't3', user_id: '1', amount: 12000, type: 'debit', category: 'entertainment', timestamp: new Date('2024-02-17T22:30:00') },
    { id: 't4', user_id: '1', amount: 75000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') },
    { id: 't5', user_id: '2', amount: 3000, type: 'debit', category: 'groceries', timestamp: new Date('2024-02-15T09:15:00') },
    { id: 't6', user_id: '2', amount: 1500, type: 'debit', category: 'fuel', timestamp: new Date('2024-02-14T17:30:00') },
    { id: 't7', user_id: '2', amount: 45000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') },
    { id: 't8', user_id: '3', amount: 35000, type: 'debit', category: 'business_expense', timestamp: new Date('2024-02-15T13:00:00') },
    { id: 't9', user_id: '3', amount: 120000, type: 'credit', category: 'business_income', timestamp: new Date('2024-02-05T14:00:00') }
  ]
};

// ========== RISK CALCULATION ENGINE ==========
const calculateRiskScore = (userId) => {
  const user = data.users.find(u => u.id === userId);
  const transactions = data.transactions.filter(t => t.user_id === userId);
  
  if (!user) return null;
  
  let score = 0.5;
  let factors = [];
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTxns = transactions.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
  const debitTxns = recentTxns.filter(t => t.type === 'debit');
  
  if (debitTxns.length === 0) {
    return {
      final_score: 0.3,
      risk_category: 'LOW',
      factors: ['No recent spending activity'],
      default_probability: 0.3,
      anomaly_score: 0.2,
      stress_score: 0.3,
      generated_at: new Date()
    };
  }
  
  const totalSpent = debitTxns.reduce((sum, t) => sum + t.amount, 0);
  const utilization = totalSpent / user.monthly_income;
  
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
  }
  
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
  }
  
  score = Math.max(0, Math.min(1, score));
  
  let category;
  if (score >= 0.7) category = 'HIGH';
  else if (score >= 0.4) category = 'MEDIUM';
  else category = 'LOW';
  
  return {
    final_score: score,
    risk_category: category,
    factors: factors.slice(0, 5),
    default_probability: score,
    anomaly_score: Math.min(score + 0.1, 1),
    stress_score: Math.min(score * 1.2, 1),
    generated_at: new Date()
  };
};

// ========== TEST ROUTES (Put these FIRST) ==========
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API is working!', 
    status: 'ok',
    time: new Date(),
    env: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== API ROUTES ==========
app.get('/api/users', (req, res) => {
  try {
    const usersWithRisk = data.users.map(user => {
      const risk = calculateRiskScore(user.id);
      return {
        ...user,
        risk_score: risk?.final_score,
        risk_category: risk?.risk_category
      };
    });
    res.json(usersWithRisk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  const user = data.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/users/:id/transactions', (req, res) => {
  const transactions = data.transactions
    .filter(t => t.user_id === req.params.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(transactions);
});

app.get('/api/users/:id/risk', (req, res) => {
  const risk = calculateRiskScore(req.params.id);
  if (!risk) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(risk);
});

app.post('/api/users/:id/transactions', (req, res) => {
  try {
    const { amount, category, type } = req.body;
    const userId = req.params.id;
    
    const newTransaction = {
      id: (data.transactions.length + 1).toString(),
      user_id: userId,
      amount: parseFloat(amount),
      type,
      category,
      timestamp: new Date()
    };
    
    data.transactions.push(newTransaction);
    const risk = calculateRiskScore(userId);
    
    res.status(201).json({ transaction: newTransaction, risk });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  const stats = {
    total_users: data.users.length,
    total_transactions: data.transactions.length,
    risk_distribution: { high: 0, medium: 0, low: 0 }
  };
  
  data.users.forEach(user => {
    const risk = calculateRiskScore(user.id);
    if (risk?.risk_category === 'HIGH') stats.risk_distribution.high++;
    else if (risk?.risk_category === 'MEDIUM') stats.risk_distribution.medium++;
    else if (risk?.risk_category === 'LOW') stats.risk_distribution.low++;
  });
  
  res.json(stats);
});

// ========== CATCH-ALL FOR PRODUCTION ==========
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Export for Vercel
module.exports = app;

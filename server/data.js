// In-memory data store
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
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      phone: '9876543213',
      occupation: 'Doctor',
      employer: 'Apollo Hospitals',
      monthly_income: 150000,
      credit_limit: 600000,
      created_at: new Date('2024-01-05')
    },
    {
      id: '5',
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      phone: '9876543214',
      occupation: 'Marketing Manager',
      employer: 'Aditya Birla Group',
      monthly_income: 85000,
      credit_limit: 350000,
      created_at: new Date('2024-01-18')
    }
  ],

  transactions: [
    // High-risk user (Rajesh) - multiple risk indicators
    { id: 't1', user_id: '1', amount: 25000, type: 'debit', category: 'shopping', timestamp: new Date('2024-02-15T10:30:00') },
    { id: 't2', user_id: '1', amount: 15000, type: 'debit', category: 'shopping', timestamp: new Date('2024-02-14T14:20:00') },
    { id: 't3', user_id: '1', amount: 5000, type: 'debit', category: 'atm_withdrawal', timestamp: new Date('2024-02-16T23:45:00') },
    { id: 't4', user_id: '1', amount: 8000, type: 'debit', category: 'atm_withdrawal', timestamp: new Date('2024-02-17T00:15:00') },
    { id: 't5', user_id: '1', amount: 12000, type: 'debit', category: 'entertainment', timestamp: new Date('2024-02-17T22:30:00') },
    { id: 't6', user_id: '1', amount: 75000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') },
    
    // Low-risk user (Priya) - stable pattern
    { id: 't7', user_id: '2', amount: 3000, type: 'debit', category: 'groceries', timestamp: new Date('2024-02-15T09:15:00') },
    { id: 't8', user_id: '2', amount: 1500, type: 'debit', category: 'fuel', timestamp: new Date('2024-02-14T17:30:00') },
    { id: 't9', user_id: '2', amount: 2000, type: 'debit', category: 'utilities', timestamp: new Date('2024-02-13T11:00:00') },
    { id: 't10', user_id: '2', amount: 45000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') },
    
    // Medium-risk user (Amit) - mixed signals
    { id: 't11', user_id: '3', amount: 35000, type: 'debit', category: 'business_expense', timestamp: new Date('2024-02-15T13:00:00') },
    { id: 't12', user_id: '3', amount: 5000, type: 'debit', category: 'dining', timestamp: new Date('2024-02-16T20:30:00') },
    { id: 't13', user_id: '3', amount: 10000, type: 'debit', category: 'shopping', timestamp: new Date('2024-02-17T15:45:00') },
    { id: 't14', user_id: '3', amount: 120000, type: 'credit', category: 'business_income', timestamp: new Date('2024-02-05T14:00:00') },
    
    // More transactions for others...
    { id: 't15', user_id: '4', amount: 8000, type: 'debit', category: 'groceries', timestamp: new Date('2024-02-16T18:00:00') },
    { id: 't16', user_id: '4', amount: 150000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') },
    { id: 't17', user_id: '5', amount: 12000, type: 'debit', category: 'shopping', timestamp: new Date('2024-02-15T16:20:00') },
    { id: 't18', user_id: '5', amount: 85000, type: 'credit', category: 'salary', timestamp: new Date('2024-02-01T09:00:00') }
  ],

  risk_scores: []  // Will be generated on-demand
};

// Helper to generate ID
data.generateId = (collection) => {
  const maxId = Math.max(...data[collection].map(item => parseInt(item.id) || 0), 0);
  return (maxId + 1).toString();
};

module.exports = data;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Typography,
  Box, Chip, List, ListItem, ListItemText,
  Divider, Button, Alert, LinearProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getUser, getUserTransactions, getUserRisk, addTransaction } from '../services/api';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    type: 'debit'
  });

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, txnRes, riskRes] = await Promise.all([
        getUser(id),
        getUserTransactions(id),
        getUserRisk(id)
      ]);
      setUser(userRes.data);
      setTransactions(txnRes.data);
      setRisk(riskRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleAddTransaction = async () => {
    try {
      await addTransaction(id, newTransaction);
      setOpenDialog(false);
      fetchUserData(); // Refresh data
      setNewTransaction({ amount: '', category: '', type: 'debit' });
    } catch (err) {
      alert('Failed to add transaction');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#f44336';
    if (score >= 0.4) return '#ff9800';
    return '#4caf50';
  };

  // Prepare chart data
  const transactionByCategory = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(transactionByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Mock history data for chart
  const historyData = [
    { date: 'Week 1', score: 0.45 },
    { date: 'Week 2', score: 0.52 },
    { date: 'Week 3', score: 0.58 },
    { date: 'Week 4', score: risk?.final_score || 0.65 }
  ];

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="error">User not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{user.name}</Typography>
                {risk && (
                  <Chip 
                    label={risk.risk_category}
                    color={risk.risk_category === 'HIGH' ? 'error' : 
                           risk.risk_category === 'MEDIUM' ? 'warning' : 'success'}
                    sx={{ ml: 2 }}
                    icon={risk.risk_category === 'HIGH' ? <WarningIcon /> : null}
                  />
                )}
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {user.occupation} at {user.employer}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Phone:</strong> {user.phone}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Monthly Income:</strong> ₹{user.monthly_income.toLocaleString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Credit Limit:</strong> ₹{user.credit_limit.toLocaleString()}
              </Typography>
              
              {risk && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6">Risk Score</Typography>
                    <Box sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%',
                      border: `8px solid ${getScoreColor(risk.final_score)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      my: 2
                    }}>
                      <Typography variant="h3">
                        {(risk.final_score * 100).toFixed(0)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Default Probability: {(risk.default_probability * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Score Trend
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Factors */}
        {risk && risk.factors && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Factors
                </Typography>
                <List>
                  {risk.factors.map((factor, index) => (
                    <ListItem key={index} divider={index < risk.factors.length - 1}>
                      <ListItemText
                        primary={factor.factor}
                        secondary={factor.description}
                      />
                      <Chip 
                        icon={factor.impact > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${factor.impact > 0 ? '+' : ''}${(factor.impact * 100).toFixed(0)}%`}
                        color={factor.impact > 0 ? 'error' : 'success'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Spending by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No spending data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                  size="small"
                >
                  Add Transaction
                </Button>
              </Box>
              <List>
                {transactions.slice(0, 10).map((txn, index) => (
                  <ListItem key={txn.id} divider={index < 9}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            <strong>{txn.category}</strong>
                          </span>
                          <Typography 
                            color={txn.type === 'credit' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={new Date(txn.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={newTransaction.type}
              label="Transaction Type"
              onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
            >
              <MenuItem value="debit">Debit (Spending)</MenuItem>
              <MenuItem value="credit">Credit (Income)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newTransaction.category}
              label="Category"
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
            >
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="groceries">Groceries</MenuItem>
              <MenuItem value="dining">Dining</MenuItem>
              <MenuItem value="fuel">Fuel</MenuItem>
              <MenuItem value="utilities">Utilities</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="atm_withdrawal">ATM Withdrawal</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTransaction} 
            variant="contained"
            disabled={!newTransaction.amount || !newTransaction.category}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDetail;

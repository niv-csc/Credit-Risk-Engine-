import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Box, CircularProgress, Alert,
  Button, Avatar, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, Warning, CheckCircle,
  Refresh, Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUsers, getStats } from '../services/api';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        getUsers(),
        getStats()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (level) => {
    switch(level) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#f44336';
    if (score >= 0.4) return '#ff9800';
    return '#4caf50';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🏦 Credit Risk Engine
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Real-time behavioural risk assessment
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Customers</Typography>
              <Typography variant="h3">{stats?.total_users || 0}</Typography>
              <Typography variant="caption">Active accounts</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="error" gutterBottom>High Risk</Typography>
              <Typography variant="h3" color="error">{stats?.risk_distribution.high || 0}</Typography>
              <Typography variant="caption">Need immediate attention</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="warning.main" gutterBottom>Medium Risk</Typography>
              <Typography variant="h3" color="warning.main">{stats?.risk_distribution.medium || 0}</Typography>
              <Typography variant="caption">Monitor closely</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography color="success.main" gutterBottom>Low Risk</Typography>
              <Typography variant="h3" color="success.main">{stats?.risk_distribution.low || 0}</Typography>
              <Typography variant="caption">Healthy customers</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions counter */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="body1">
          📊 Total Transactions Analyzed: <strong>{stats?.total_transactions || 0}</strong>
        </Typography>
      </Paper>

      {/* Users Table */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Customer Risk Analysis
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Occupation</strong></TableCell>
              <TableCell><strong>Monthly Income</strong></TableCell>
              <TableCell><strong>Risk Score</strong></TableCell>
              <TableCell><strong>Risk Level</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: user.risk_category === 'HIGH' ? 'error.main' : 
                                              user.risk_category === 'MEDIUM' ? 'warning.main' : 'success.main' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2"><strong>{user.name}</strong></Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.occupation}</TableCell>
                <TableCell>₹{user.monthly_income.toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%',
                      border: `3px solid ${getScoreColor(user.risk_score || 0)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1
                    }}>
                      <Typography variant="body2" fontWeight="bold">
                        {user.risk_score ? (user.risk_score * 100).toFixed(0) : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {user.risk_category && (
                    <Chip 
                      label={user.risk_category}
                      color={getRiskColor(user.risk_category)}
                      size="small"
                      icon={user.risk_category === 'HIGH' ? <Warning /> : 
                            user.risk_category === 'MEDIUM' ? <TrendingUp /> : <CheckCircle />}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* How it works */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: '#fafafa' }}>
        <Typography variant="h6" gutterBottom>
          🔍 How Risk is Calculated
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              <strong>1. Utilization (30%)</strong><br/>
              Spending vs income ratio
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              <strong>2. Night Transactions (20%)</strong><br/>
              Late night spending patterns
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              <strong>3. Cash Advances (20%)</strong><br/>
              ATM & cash withdrawals
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              <strong>4. Volatility (15%)</strong><br/>
              Spending pattern stability
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;

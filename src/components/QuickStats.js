import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../Styles/QuickStats.css';

const QuickStats = ({ userId }) => {
  const [stats, setStats] = useState({
    totalSpent: 0,
    categories: {},
    mostExpensive: null,
    monthlyTotals: {},
  });
  const [loading, setLoading] = useState(true);

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  useEffect(() => {
    calculateStats();
  }, [userId]);

  const calculateStats = () => {
    setLoading(true);
    try {
      const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const userExpenses = allExpenses.filter(expense => expense.userId === userId);
      
      if (userExpenses.length === 0) {
        setStats({
          totalSpent: 0,
          categories: {},
          mostExpensive: null,
          monthlyTotals: {}
        });
        setLoading(false);
        return;
      }
      
      // Calculate total spent
      const totalSpent = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate spending by category
      const categories = {};
      userExpenses.forEach(expense => {
        if (!categories[expense.category]) {
          categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
      });
      
      // Find most expensive expense
      const mostExpensive = userExpenses.sort((a, b) => b.amount - a.amount)[0];
      
      // Calculate monthly spending
      const monthlyTotals = {};
      userExpenses.forEach(expense => {
        // Extract year and month from the date
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const yearMonth = `${month} ${year}`;
        
        if (!monthlyTotals[yearMonth]) {
          monthlyTotals[yearMonth] = 0;
        }
        monthlyTotals[yearMonth] += expense.amount;
      });
      
      setStats({
        totalSpent,
        categories,
        mostExpensive,
        monthlyTotals
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopCategory = () => {
    if (Object.keys(stats.categories).length === 0) return 'No data';
    
    return Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])[0][0];
  };

  const getLargestExpense = () => {
    if (!stats.mostExpensive) return 'No data';
    
    return `$${stats.mostExpensive.amount.toFixed(2)} (${stats.mostExpensive.category})`;
  };

  // Format data for pie chart
  const preparePieChartData = () => {
    return Object.entries(stats.categories).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Format data for bar chart
  const prepareBarChartData = () => {
    // Get the last 6 months or all months if less than 6
    return Object.entries(stats.monthlyTotals)
      .sort((a, b) => {
        // Convert month names to dates for proper sorting
        const monthA = new Date(a[0].replace(' ', ' 1, '));
        const monthB = new Date(b[0].replace(' ', ' 1, '));
        return monthB - monthA; // Sort newest to oldest
      })
      .slice(0, 6) // Take the most recent 6 months
      .reverse() // Reverse to display oldest to newest
      .map(([month, amount]) => ({
        month,
        amount
      }));
  };

  return (
    <div className="quick-stats-container">
      {loading ? (
        <div className="stats-loading">
          <div className="stats-loader"></div>
          <p>Calculating your stats...</p>
        </div>
      ) : (
        <>
          <div className="stats-header">
            <h2>Your Financial Overview</h2>
            <button className="refresh-stats-btn" onClick={calculateStats} title="Refresh stats">
              ↻
            </button>
          </div>

          <div className="stats-summary">
            <div className="stats-card">
              <h3>Total Spent</h3>
              <p className="stats-value">${stats.totalSpent.toFixed(2)}</p>
            </div>
            
            <div className="stats-card">
              <h3>Top Category</h3>
              <p className="stats-value">{getTopCategory()}</p>
            </div>
            
            <div className="stats-card">
              <h3>Largest Expense</h3>
              <p className="stats-value">{getLargestExpense()}</p>
            </div>
          </div>
          
          <div className="stats-charts">
            <div className="chart-container">
              <h3>Spending by Category</h3>
              {Object.keys(stats.categories).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={preparePieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">No category data available</div>
              )}
            </div>
            
            <div className="chart-container">
              <h3>Monthly Spending Trend</h3>
              {Object.keys(stats.monthlyTotals).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={prepareBarChartData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                    <Bar dataKey="amount" name="Spending" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">No monthly data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickStats;
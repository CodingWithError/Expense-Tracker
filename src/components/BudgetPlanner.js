import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../Styles/BudgetPlanner.css';

const BudgetPlanner = ({ userId, onShowNotification }) => {
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [actualSpending, setActualSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [viewMode, setViewMode] = useState('pie'); 
  const [sortBy, setSortBy] = useState('amount'); 

  const categories = [
    { name: 'Food & Dining', color: '#FF8042', emoji: '🍽️' },
    { name: 'Transportation', color: '#0088FE', emoji: '🚗' },
    { name: 'Entertainment', color: '#FFBB28', emoji: '🎬' },
    { name: 'Utilities', color: '#00C49F', emoji: '💡' },
    { name: 'Housing', color: '#8884d8', emoji: '🏠' },
    { name: 'Shopping', color: '#82ca9d', emoji: '🛍️' },
    { name: 'Healthcare', color: '#ffc658', emoji: '🏥' },
    { name: 'Education', color: '#8dd1e1', emoji: '📚' },
    { name: 'Travel', color: '#a4de6c', emoji: '✈️' },
    { name: 'Personal Care', color: '#d0ed57', emoji: '💇' },
    { name: 'Other', color: '#b8b8b8', emoji: '📌' }
  ];

  useEffect(() => {
    loadBudgets();
    calculateActualSpending();
  }, [userId]);

  const loadBudgets = () => {
    setLoading(true);
    try {
      const savedBudgets = JSON.parse(localStorage.getItem(`budgets_${userId}`) || '[]');
      setBudgets(savedBudgets);
      
      const total = savedBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
      setTotalBudget(total);
    } catch (error) {
      console.error('Error loading budgets:', error);
      if (onShowNotification) {
        onShowNotification('❌ Error loading budget data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateActualSpending = () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      
      const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      
      const userExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.userId === userId && expenseDate >= startOfMonth;
      });
      
      const spendingByCategory = {};
      userExpenses.forEach(expense => {
        if (!spendingByCategory[expense.category]) {
          spendingByCategory[expense.category] = 0;
        }
        spendingByCategory[expense.category] += expense.amount;
      });
      
      setActualSpending(spendingByCategory);
    } catch (error) {
      console.error('Error calculating actual spending:', error);
    }
  };

  const getEmoji = (categoryName) => {
    const found = categories.find(cat => cat.name === categoryName);
    return found ? found.emoji : '📋';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      if (onShowNotification) {
        onShowNotification('❌ Please fill all required fields', 'error');
      }
      return;
    }
    
    try {
      const updatedBudgets = [...budgets];
      const newBudget = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: editIndex !== null ? updatedBudgets[editIndex].id : Date.now()
      };
      
      if (editIndex !== null) {
        updatedBudgets[editIndex] = newBudget;
      } else {
        updatedBudgets.push(newBudget);
      }
      
      localStorage.setItem(`budgets_${userId}`, JSON.stringify(updatedBudgets));
      
      setBudgets(updatedBudgets);
      
      const newTotal = updatedBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
      setTotalBudget(newTotal);
      
      setFormData({
        category: '',
        amount: '',
        period: 'monthly'
      });
      setShowForm(false);
      setEditIndex(null);
      
      if (onShowNotification) {
        onShowNotification(
          editIndex !== null ? '✅ Budget updated successfully' : '✅ Budget added successfully',
          'success'
        );
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      if (onShowNotification) {
        onShowNotification('❌ Error saving budget data', 'error');
      }
    }
  };

  const handleEdit = (index) => {
    const budgetToEdit = budgets[index];
    setFormData({
      category: budgetToEdit.category,
      amount: budgetToEdit.amount.toString(),
      period: budgetToEdit.period
    });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const updatedBudgets = [...budgets];
        updatedBudgets.splice(index, 1);
        
        localStorage.setItem(`budgets_${userId}`, JSON.stringify(updatedBudgets));
        
        setBudgets(updatedBudgets);
        
        const newTotal = updatedBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
        setTotalBudget(newTotal);
        
        if (onShowNotification) {
          onShowNotification('✅ Budget deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting budget:', error);
        if (onShowNotification) {
          onShowNotification('❌ Error deleting budget', 'error');
        }
      }
    }
  };

  const getBudgetStatus = (budget) => {
    const spent = actualSpending[budget.category] || 0;
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      return 'exceeded';
    } else if (percentage >= 80) {
      return 'warning';
    } else {
      return 'good';
    }
  };

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'exceeded': return '🚨';
      case 'warning': return '⚠️';
      case 'good': return '✅';
      default: return '📊';
    }
  };

  const preparePieChartData = () => {
    return budgets.map(budget => {
      const spent = actualSpending[budget.category] || 0;
      return {
        name: budget.category,
        value: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
        color: categories.find(cat => cat.name === budget.category)?.color || '#cccccc'
      };
    });
  };

  const prepareBarChartData = () => {
    return budgets.map(budget => {
      const spent = actualSpending[budget.category] || 0;
      return {
        name: budget.category,
        Budget: budget.amount,
        Spent: spent,
        Remaining: budget.amount - spent,
        color: categories.find(cat => cat.name === budget.category)?.color || '#cccccc'
      };
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return b.Budget - a.Budget;
      } else if (sortBy === 'spent') {
        return b.Spent - a.Spent;
      } else if (sortBy === 'remaining') {
        return b.Remaining - a.Remaining;
      }
      return 0;
    });
  };

  const getCategoryColor = (categoryName) => {
    return categories.find(cat => cat.name === categoryName)?.color || '#cccccc';
  };

  const getTotalSpent = () => {
    return Object.values(actualSpending).reduce((sum, amount) => sum + amount, 0);
  };

  const getTotalRemaining = () => {
    return totalBudget - getTotalSpent();
  };

  const getPercentSpent = () => {
    if (totalBudget === 0) return 0;
    return (getTotalSpent() / totalBudget) * 100;
  };

  
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="budget-planner">
      <div className="budget-header">
        <h2>💰 Budget Planner</h2>
        <div className="budget-actions">
          <button 
            className="refresh-btn"
            onClick={() => {
              calculateActualSpending();
              if (onShowNotification) {
                onShowNotification('✅ Budget data refreshed', 'success');
              }
            }}
            title="Refresh data"
          >
            🔄
          </button>
          <button 
            className="add-budget-btn"
            onClick={() => {
              setFormData({
                category: '',
                amount: '',
                period: 'monthly'
              });
              setEditIndex(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '➕ Add Budget'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="budget-form-container">
          <h3>{editIndex !== null ? '✏️ Edit Budget' : '💵 Add New Budget'}</h3>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="emoji-select"
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Budget Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="period">Period</label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
              >
                <option value="monthly">📅 Monthly</option>
                <option value="weekly">📆 Weekly</option>
                <option value="yearly">📆 Yearly</option>
              </select>
            </div>
            
            <button type="submit" className="submit-btn">
              {editIndex !== null ? '✅ Update Budget' : '➕ Add Budget'}
            </button>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading-budgets">⏳ Loading budget data...</div>
      ) : (
        <div className="budget-content">
          {budgets.length === 0 ? (
            <div className="no-budgets">
              <p>📝 You haven't set any budgets yet. Click "Add Budget" to get started.</p>
            </div>
          ) : (
            <>
              <div className="budget-summary">
                <div className="total-budget">
                  <h3>📊 Total Monthly Budget</h3>
                  <p className="budget-amount">{formatCurrency(totalBudget)}</p>
                  <div className="budget-stats">
                    <div className="stat-row">
                      <div className="stat-label">💸 Spent:</div>
                      <div className="stat-value">{formatCurrency(getTotalSpent())}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">💰 Remaining:</div>
                      <div className="stat-value">{formatCurrency(getTotalRemaining())}</div>
                    </div>
                    <div className="budget-progress overall">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${getPercentSpent() >= 100 ? 'exceeded' : getPercentSpent() >= 80 ? 'warning' : 'good'}`}
                          style={{ width: `${Math.min(100, getPercentSpent())}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{getPercentSpent().toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="budget-chart">
                  <div className="chart-header">
                    <h3>📈 Budget Allocation</h3>
                    <div className="chart-controls">
                      <div className="view-toggle">
                        <button 
                          className={`view-btn ${viewMode === 'pie' ? 'active' : ''}`}
                          onClick={() => setViewMode('pie')}
                        >
                          🥧 Pie
                        </button>
                        <button 
                          className={`view-btn ${viewMode === 'bar' ? 'active' : ''}`}
                          onClick={() => setViewMode('bar')}
                        >
                          📊 Bar
                        </button>
                      </div>
                      {viewMode === 'bar' && (
                        <div className="sort-controls">
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                          >
                            <option value="amount">Sort by Budget</option>
                            <option value="spent">Sort by Spent</option>
                            <option value="remaining">Sort by Remaining</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    {viewMode === 'pie' ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={preparePieChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${getEmoji(name)} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {preparePieChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => {
                              if (name === 'value') {
                                return [`Budget: ${formatCurrency(value)}`, `${getEmoji(props.payload.name)} ${props.payload.name}`];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend formatter={(value) => {
                            const cat = categories.find(c => c.name === value);
                            return cat ? `${cat.emoji} ${value}` : value;
                          }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={prepareBarChartData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tickFormatter={(value) => `${getEmoji(value)}`}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name, props) => {
                              return [formatCurrency(value), name];
                            }}
                            labelFormatter={(value) => {
                              return `${getEmoji(value)} ${value}`;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="Budget" fill="#8884d8" />
                          <Bar dataKey="Spent" fill="#82ca9d" />
                          <Bar dataKey="Remaining" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="budget-list">
                <h3>📋 Your Budgets</h3>
                <div className="budget-items">
                  {budgets.map((budget, index) => {
                    const spent = actualSpending[budget.category] || 0;
                    const percentage = Math.min(100, (spent / budget.amount) * 100);
                    const status = getBudgetStatus(budget);
                    const statusEmoji = getStatusEmoji(status);
                    
                    return (
                      <div key={budget.id} className={`budget-item ${status}`}>
                        <div className="budget-item-header">
                          <div className="budget-category">
                            <span className="category-dot" style={{ backgroundColor: getCategoryColor(budget.category) }}></span>
                            <h4>{getEmoji(budget.category)} {budget.category}</h4>
                          </div>
                          <div className="budget-actions">
                            <button 
                              className="edit-btn" 
                              onClick={() => handleEdit(index)}
                              aria-label={`Edit ${budget.category} budget`}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(index)}
                              aria-label={`Delete ${budget.category} budget`}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="budget-details">
                          <div className="budget-info">
                            <p>💰 Budget: <strong>{formatCurrency(budget.amount)}</strong> ({budget.period})</p>
                            <p>💸 Spent: <strong>{formatCurrency(spent)}</strong> ({percentage.toFixed(1)}%)</p>
                            <p>💵 Remaining: <strong>{formatCurrency(budget.amount - spent)}</strong></p>
                            <p>Status: <strong>{statusEmoji} {status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
                          </div>
                          
                          <div className="budget-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;
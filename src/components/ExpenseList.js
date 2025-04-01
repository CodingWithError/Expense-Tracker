import React, { useState, useEffect } from 'react';
import '../Styles/ExpenseList.css';

const ExpenseList = ({ userId, onShowNotification }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchExpenses();
  }, [userId, selectedCategory, searchTerm, sortBy, sortOrder, dateRange]);

  const fetchExpenses = () => {
    setLoading(true);
    
    try {
      // Simulate fetching data with a slight delay
      setTimeout(() => {
        // Get expenses from localStorage
        const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Filter expenses by userId
        let filteredExpenses = allExpenses.filter(expense => expense.userId === userId);
        
        // Apply date range filter if provided
        if (dateRange.start && dateRange.end) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include the end date fully
          
          filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
          });
        }
        
        // Apply category filter if needed
        if (selectedCategory !== 'All') {
          filteredExpenses = filteredExpenses.filter(expense => expense.category === selectedCategory);
        }
        
        // Apply search filter if needed
        if (searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase();
          filteredExpenses = filteredExpenses.filter(expense => 
            expense.description?.toLowerCase().includes(searchLower) ||
            expense.category.toLowerCase().includes(searchLower) ||
            expense.amount.toString().includes(searchLower)
          );
        }
        
        // Apply sorting
        filteredExpenses.sort((a, b) => {
          if (sortBy === 'date') {
            return sortOrder === 'asc' 
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date);
          } else if (sortBy === 'amount') {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
          } else if (sortBy === 'category') {
            return sortOrder === 'asc' 
              ? a.category.localeCompare(b.category)
              : b.category.localeCompare(a.category);
          }
          return 0;
        });
        
        // Calculate total amount
        const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        setExpenses(filteredExpenses);
        setTotalAmount(total);
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error("Error fetching expenses: ", err);
      setError("Failed to load expenses. Please try again later.");
      setLoading(false);
      if (onShowNotification) {
        onShowNotification("Error loading expenses", "error");
      }
    }
  };

  const refreshExpenses = () => {
    fetchExpenses();
    if (onShowNotification) {
      onShowNotification("Expenses refreshed", "info");
    }
  };

  // Categories for filter dropdown (must match the ones in ExpenseForm)
  const categories = [
    'All',
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Housing',
    'Shopping',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Other'
  ];

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!expenseToDelete) return;
    
    try {
      // Get all expenses from localStorage
      const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      
      // Filter out the expense to delete
      const updatedExpenses = allExpenses.filter(expense => expense.id !== expenseToDelete.id);
      
      // Save back to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update state with filtered expenses
      setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
      
      // Recalculate total amount
      const newTotal = expenses
        .filter(expense => expense.id !== expenseToDelete.id)
        .reduce((sum, expense) => sum + expense.amount, 0);
      setTotalAmount(newTotal);
      
      if (onShowNotification) {
        onShowNotification("Expense deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting expense: ", error);
      if (onShowNotification) {
        onShowNotification("Failed to delete expense", "error");
      }
    } finally {
      setIsConfirmModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column with default desc order
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
    setShowFilters(false);
    
    if (onShowNotification) {
      onShowNotification("Filters cleared", "info");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return (
      <span className="sort-icon">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h2>Your Expenses</h2>
        <div className="expense-actions">
          <button 
            className="refresh-btn"
            onClick={refreshExpenses}
            title="Refresh expenses"
          >
            ↻
          </button>
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="expense-filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <label htmlFor="category-select">Category:</label>
            <select 
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="date-filter">
            <div className="date-range">
              <label htmlFor="start-date">From:</label>
              <input
                type="date"
                id="start-date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            
            <div className="date-range">
              <label htmlFor="end-date">To:</label>
              <input
                type="date"
                id="end-date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}
      
      <div className="expense-total-bar">
        <span className="total-label">Total:</span>
        <span className="total-amount">${totalAmount.toFixed(2)}</span>
        <span className="expense-count">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && <div className="loading-expenses">Loading expenses...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && expenses.length === 0 && (
        <div className="no-expenses">
          <p>No expenses found. Start by adding a new expense!</p>
        </div>
      )}
      
      {expenses.length > 0 && (
        <div className="expense-table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} className="sortable-header">
                  Date {renderSortIcon('date')}
                </th>
                <th onClick={() => handleSort('category')} className="sortable-header">
                  Category {renderSortIcon('category')}
                </th>
                <th>Description</th>
                <th onClick={() => handleSort('amount')} className="sortable-header amount-column">
                  Amount {renderSortIcon('amount')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="expense-row">
                  <td>{formatDate(expense.date)}</td>
                  <td>
                    <span className="category-badge">{expense.category}</span>
                  </td>
                  <td className="description-cell">
                    {expense.description 
                      ? expense.description.length > 30 
                        ? `${expense.description.substring(0, 30)}...` 
                        : expense.description
                      : '-'
                    }
                  </td>
                  <td className="amount-column">${expense.amount.toFixed(2)}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewExpense(expense)}
                      aria-label="View expense details"
                    >
                      View
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteExpense(expense)}
                      aria-label="Delete expense"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this expense?</p>
            <p className="expense-details">
              <strong>${expenseToDelete?.amount.toFixed(2)}</strong> for <strong>{expenseToDelete?.category}</strong> on {formatDate(expenseToDelete?.date)}
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Expense Modal */}
      {isViewModalOpen && selectedExpense && (
        <div className="modal-overlay">
          <div className="view-modal">
            <div className="modal-header">
              <h3>Expense Details</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsViewModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="expense-detail-content">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">
                  <span className="category-badge">{selectedExpense.category}</span>
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value amount">${selectedExpense.amount.toFixed(2)}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(selectedExpense.date)}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value description">
                  {selectedExpense.description || 'No description provided'}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(selectedExpense.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="delete-btn"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleDeleteExpense(selectedExpense);
                }}
              >
                Delete
              </button>
              <button 
                className="close-btn"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
import React, { useState, useEffect } from 'react';
import '../Styles/ExpenseList.css';

const ExpenseList = ({ userId, onDataChange }) => {
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

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    
    try {
      // Simulate fetching data with a slight delay
      setTimeout(() => {
        // Get expenses from localStorage
        const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Filter expenses by userId
        let filteredExpenses = allExpenses.filter(expense => expense.userId === userId);
        
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
    }
  }, [userId, selectedCategory, searchTerm, sortBy, sortOrder]);

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
      
      // Notify parent component of data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting expense: ", error);
      alert("Failed to delete the expense. Please try again.");
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
        <div className="expense-controls">
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
            <label htmlFor="category-select">Filter by:</label>
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
          
          <div className="expense-total">
            <strong>Total:</strong> ${totalAmount.toFixed(2)}
          </div>
        </div>
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
                  <td>{expense.description || '-'}</td>
                  <td className="amount-column">${expense.amount.toFixed(2)}</td>
                  <td>
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
    </div>
  );
};

export default ExpenseList;
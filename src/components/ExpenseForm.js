import React, { useState, useEffect } from 'react';
import '../Styles/ExpenseForm.css';

const ExpenseForm = ({ userId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formStep, setFormStep] = useState(1);
  const [recentCategories, setRecentCategories] = useState([]);

  // Categories for dropdown
  const categories = [
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

  // Get today's date as default value
  const today = new Date().toISOString().split('T')[0];

  // Initialize date with today's date when component mounts
  useEffect(() => {
    setDate(today);
    
    // Get user's recent categories
    try {
      const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const userExpenses = allExpenses.filter(expense => expense.userId === userId);
      
      // Get most recent unique categories (up to 3)
      const recent = [...new Set(userExpenses.map(exp => exp.category))].slice(0, 3);
      setRecentCategories(recent);
    } catch (error) {
      console.error('Error loading recent categories:', error);
    }
  }, [today, userId]);

  const handleCategoryQuickSelect = (cat) => {
    setCategory(cat);
    setFormStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!amount || !category || !date) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    // Convert amount to number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create expense object to store
      const expenseData = {
        id: Date.now().toString(), // Generate unique ID
        amount: amountNum,
        category,
        date,
        description,
        userId, // To link expense with user
        createdAt: new Date()
      };

      // Get existing expenses from localStorage
      const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      
      // Add new expense to the array
      const updatedExpenses = [expenseData, ...existingExpenses];
      
      // Save back to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Reset form after successful submission
      setAmount('');
      setCategory('');
      setDate(today);
      setDescription('');
      setFormStep(1);
      setMessage({ text: 'Expense added successfully!', type: 'success' });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error adding expense: ', error);
      setMessage({ text: 'Error adding expense. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="form-step-header">
        <h3>Step 1: Select Category</h3>
        <div className="step-indicator">
          <div className="step active"></div>
          <div className="step"></div>
        </div>
      </div>
      
      {recentCategories.length > 0 && (
        <div className="quick-categories">
          <p>Recent categories:</p>
          <div className="category-buttons">
            {recentCategories.map(cat => (
              <button 
                key={cat} 
                type="button" 
                className="category-btn"
                onClick={() => handleCategoryQuickSelect(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <button 
        type="button" 
        className="next-btn"
        onClick={() => setFormStep(2)}
        disabled={!category}
      >
        Next
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="form-step-header">
        <h3>Step 2: Enter Details</h3>
        <div className="step-indicator">
          <div className="step"></div>
          <div className="step active"></div>
        </div>
      </div>
      
      <div className="selected-category">
        <p>Category: <strong>{category}</strong></p>
        <button 
          type="button" 
          className="change-btn"
          onClick={() => setFormStep(1)}
        >
          Change
        </button>
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">Amount ($) *</label>
        <input
          type="number"
          id="amount"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add optional notes about this expense"
          rows="3"
        />
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="back-btn"
          onClick={() => setFormStep(1)}
        >
          Back
        </button>
        <button 
          type="submit" 
          className={isLoading ? 'loading' : ''}
          disabled={isLoading || !amount}
        >
          {isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </>
  );

  return (
    <div className="expense-form-container">
      <h2>Add New Expense</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {formStep === 1 ? renderStep1() : renderStep2()}
      </form>
    </div>
  );
};

export default ExpenseForm;
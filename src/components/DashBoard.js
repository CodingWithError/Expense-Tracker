import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import QuickStats from './QuickStats';
import Login from './Login';
import '../Styles/DashBoard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', or 'stats'

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = () => {
      // Check if user data exists in localStorage
      const userData = localStorage.getItem('expenseTrackerUser');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };
    
    // Simulate a short delay like a real auth check
    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('expenseTrackerUser');
    setUser(null);
  };

  // Handle tab switching with a single state
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your expenses...</p>
      </div>
    );
  }

  // If no user is logged in, show login component
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Expense Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
        >
          View Expenses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => handleTabChange('add')}
        >
          Add Expense
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          Quick Stats
        </button>
      </div>
      
      <main className="dashboard-main">
        {activeTab === 'list' && <ExpenseList userId={user.id} />}
        {activeTab === 'add' && <ExpenseForm userId={user.id} onSuccess={() => handleTabChange('list')} />}
        {activeTab === 'stats' && <QuickStats userId={user.id} />}
      </main>

      <footer className="dashboard-footer">
        <p>Expense Tracker &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Dashboard;
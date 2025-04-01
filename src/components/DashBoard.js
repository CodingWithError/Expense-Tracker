import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import QuickStats from './QuickStats';
import BudgetPlanner from './BudgetPlanner';
import Login from './Login';
import '../Styles/DashBoard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('expenseTrackerUser');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };
    
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
    
    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('expenseTrackerUser');
    setUser(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const showNotificationMessage = (message, type = 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your expenses...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Expense Tracker</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>Welcome, Tester</span>
          </div>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
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
          Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => handleTabChange('budget')}
        >
          Budget Planner
        </button>
      </div>
      
      <main className="dashboard-main">
        {activeTab === 'list' && <ExpenseList userId={user.id} onShowNotification={showNotificationMessage} />}
        
        {activeTab === 'add' && (
          <ExpenseForm 
            userId={user.id} 
            onSuccess={() => {
              handleTabChange('list');
              showNotificationMessage('Expense added successfully!', 'success');
            }} 
          />
        )}
        
        {activeTab === 'stats' && <QuickStats userId={user.id} />}
        
        {activeTab === 'budget' && <BudgetPlanner userId={user.id} onShowNotification={showNotificationMessage} />}
      </main>

      {showNotification && (
        <div className={`notification ${notification.type}`}>
          <p>{notification.message}</p>
          <button 
            onClick={() => setShowNotification(false)}
            className="notification-close"
          >
            ×
          </button>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>By CodingWithError</p>
      </footer>
    </div>
  );
};

export default Dashboard;
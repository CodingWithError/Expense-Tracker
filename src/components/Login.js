import React, { useState } from 'react';
import '../Styles/Login.css';
import guyImage from '../assets/guy.jpg.jpeg';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simulate authentication process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid email or password too short (min 6 characters)');
      }
      
      // Create user object
      const user = {
        id: `user_${Date.now()}`,
        email: email,
        createdAt: new Date()
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('expenseTrackerUser', JSON.stringify(user));
      
      // Notify parent component about successful login
      if (onLogin) {
        onLogin(user);
      }
      
      console.log(`User ${isSignUp ? 'registered' : 'logged in'} with email: ${email}`);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image-container">
          <img src={guyImage} alt="Person with charts" className="guy-image" />
        </div>
        <div className="login-form-container">
          <h2>{isSignUp ? 'Create Account' : 'Login to Expense Tracker'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <p className="switch-mode">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="text-button"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
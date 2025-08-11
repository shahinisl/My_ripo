'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import usersData from '../data/users.json';

interface LoginProps {
  setCurrentUser: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple authentication check against users data
    const user = usersData.find(u => u.email === email);
    
    if (user && password === 'password123') { // Simple password check for demo
      setCurrentUser(user);
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-logins">
            <h3>Demo Accounts</h3>
            <p>Click to quickly login with demo credentials:</p>
            <div className="demo-buttons">
              <button 
                onClick={() => handleDemoLogin('john.smith@inftimes.com')}
                className="demo-button"
              >
                👨‍💻 Login as Journalist (John Smith)
              </button>
              <button 
                onClick={() => handleDemoLogin('sarah.johnson@inftimes.com')}
                className="demo-button"
              >
                ✍️ Login as Writer (Sarah Johnson)
              </button>
              <button 
                onClick={() => handleDemoLogin('carlos.rodriguez@inftimes.com')}
                className="demo-button"
              >
                📰 Login as Publisher (Carlos Rodriguez)
              </button>
              <button 
                onClick={() => handleDemoLogin('emma.wilson@example.com')}
                className="demo-button"
              >
                👤 Login as Reader (Emma Wilson)
              </button>
              <button 
                onClick={() => handleDemoLogin('admin@inftimes.com')}
                className="demo-button admin-demo"
              >
                👑 Login as Admin (David Chen)
              </button>
            </div>
          </div>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="social-button google">
              🔍 Continue with Google
            </button>
            <button className="social-button facebook">
              📘 Continue with Facebook
            </button>
            <button className="social-button twitter">
              🐦 Continue with Twitter
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="auth-help">
            <h4>Need Help?</h4>
            <ul>
              <li>• Check your email and password</li>
              <li>• Make sure Caps Lock is off</li>
              <li>• Try the demo accounts above</li>
              <li>• Default password for all demo accounts: password123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

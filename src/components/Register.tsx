'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RegisterProps {
  setCurrentUser: (user: any) => void;
}

const Register: React.FC<RegisterProps> = ({ setCurrentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Normal User',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new user object
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      bio: '',
      profileImage: '/images/default-avatar.jpg',
      joinDate: new Date().toISOString().split('T')[0],
      articlesPublished: 0,
      totalViews: 0,
      followers: 0,
      following: 0,
      verified: false,
      specialties: []
    };
    
    setCurrentUser(newUser);
    setIsLoading(false);
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Join The Informative Times</h1>
            <p>Create your account to start reading and writing</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Normal User">Reader</option>
                <option value="Writer">Writer</option>
                <option value="Journalist">Journalist</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="accept-terms">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                I accept the Terms of Service and Privacy Policy
              </label>
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

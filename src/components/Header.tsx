'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import categoriesData from '../data/categories.json';

interface HeaderProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, setCurrentUser, searchQuery, setSearchQuery }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <div className="logo">
            <Link href="/" className="logo-button">
              <h1>The Informative Times</h1>
              <span className="tagline">The Pulse of Today's World</span>
            </Link>
          </div>
          
          <div className="header-actions">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">🔍</button>
            </form>

            <div className="language-selector">
              <button 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="language-button"
              >
                🌐 EN
              </button>
              {showLanguageMenu && (
                <div className="language-menu">
                  <button>English</button>
                  <button>Español</button>
                  <button>Français</button>
                </div>
              )}
            </div>

            {currentUser ? (
              <div className="user-menu">
                <Link href="/dashboard" className="user-button">
                  👤 {currentUser.name}
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/login" className="login-button">
                  Login
                </Link>
                <Link href="/register" className="register-button">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="main-nav">
          <div className="nav-container">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              ☰
            </button>
            
            <ul className={`nav-menu ${showMobileMenu ? 'show' : ''}`}>
              <li>
                <Link href="/" className="nav-link">
                  Home
                </Link>
              </li>
              {categoriesData.slice(0, 8).map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.name.toLowerCase()}`}
                    className="nav-link"
                  >
                    {category.icon} {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

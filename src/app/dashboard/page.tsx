'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Dashboard from '../../components/Dashboard';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-required">
        <div className="container">
          <h2>Access Denied</h2>
          <p>You need to be logged in to access the dashboard.</p>
          <button 
            onClick={() => router.push('/login')}
            className="login-button"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
        <Dashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </main>
      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

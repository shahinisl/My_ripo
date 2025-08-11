'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Login from '../../components/Login';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleUserLogin = (user: any) => {
    setCurrentUser(user);
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Redirect to dashboard after login
    router.push('/dashboard');
  };

  return (
    <>
      <Header 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
        <Login 
          setCurrentUser={handleUserLogin}
        />
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

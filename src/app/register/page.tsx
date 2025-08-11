'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Register from '../../components/Register';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleUserRegister = (user: any) => {
    setCurrentUser(user);
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Redirect to dashboard after registration
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
        <Register 
          setCurrentUser={handleUserRegister}
        />
      </main>
      <Footer />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

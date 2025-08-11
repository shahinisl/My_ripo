'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HomePage from '../components/HomePage';

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  return (
    <>
      <Header 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
        <HomePage 
          searchQuery={searchQuery}
          currentUser={currentUser}
        />
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

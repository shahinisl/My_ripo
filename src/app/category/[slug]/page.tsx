'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import CategoryPage from '../../../components/CategoryPage';

export default function Category() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Convert slug to category name (capitalize first letter)
  const categoryName = typeof params.slug === 'string' ? 
    params.slug.charAt(0).toUpperCase() + params.slug.slice(1) : '';

  return (
    <>
      <Header 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
        <CategoryPage 
          categoryName={categoryName}
          currentUser={currentUser}
        />
      </main>
      <Footer />
    </>
  );
}

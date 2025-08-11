'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ArticlePage from '../../../components/ArticlePage';

export default function Article() {
  const params = useParams();
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
        <ArticlePage 
          articleId={Number(params.id)}
          currentUser={currentUser}
        />
      </main>
      <Footer />
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import articlesData from '../data/articles.json';
import categoriesData from '../data/categories.json';

// Default photo links for fallback images
const defaultPhotoLinks = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1566876657812-66eb7b3b1ad5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/flagged/photo-1564430002610-40d4f8826bff?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://unsplash.com/photos/a-woman-with-long-hair-and-red-lipstick-jiDI-QW1A7k",
  "https://unsplash.com/photos/selective-focus-photography-of-woman-leaning-near-window-YQI9sjdd1-o",
  "https://images.unsplash.com/photo-1563934328191-a4cd785cdbe5?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1588635595073-43fb9c6f6750?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1684361436012-3e30cd929e83?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1687327528676-f2eee5d4a517?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

interface HomePageProps {
  searchQuery: string;
  currentUser: any;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery, currentUser }) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    setArticles(articlesData);
    setFilteredArticles(articlesData);
  }, []);

  useEffect(() => {
    let filtered = articles;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'trending') {
        filtered = filtered.filter(article => article.trending);
      } else if (selectedFilter === 'latest') {
        filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        filtered = filtered.filter(article => article.category === selectedFilter);
      }
    }

    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedFilter]);

  const featuredArticles = articles.filter(article => article.featured);
  const trendingArticles = articles.filter(article => article.trending);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ArticleCard: React.FC<{ article: any; featured?: boolean }> = ({ article, featured = false }) => (
    <article className={`article-card ${featured ? 'featured' : ''}`}>
      <div className="article-image">
        <img 
          src={
            article.image ||
            defaultPhotoLinks[article.id % defaultPhotoLinks.length] ||
            '/images/placeholder.jpg'
          }
          alt={article.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultPhotoLinks[article.id % defaultPhotoLinks.length] || '/images/placeholder.jpg';
          }}
        />
        <span className="category-tag" style={{ backgroundColor: categoriesData.find(cat => cat.name === article.category)?.color }}>
          {article.category}
        </span>
      </div>
      <div className="article-content">
        <h3 className="article-title">
          <Link href={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h3>
        <p className="article-summary">{article.summary}</p>
        <div className="article-meta">
          <div className="author-info">
            <Link href={`/profile/${article.authorId}`} className="author-link">
              By {article.author}
            </Link>
            <span className="article-date">{formatDate(article.date)}</span>
          </div>
          <div className="article-stats">
            <span className="views">👁️ {article.views.toLocaleString()}</span>
            <span className="likes">👍 {article.likes}</span>
            <span className="dislikes">👎 {article.dislikes}</span>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section with Featured Articles */}
        {!searchQuery && (
          <section className="hero-section">
            <h2>Featured Stories</h2>
            <div className="featured-articles">
              {featuredArticles.slice(0, 3).map(article => (
                <ArticleCard key={article.id} article={article} featured={true} />
              ))}
            </div>
          </section>
        )}

        {/* Filter Section */}
        <section className="filter-section">
          <div className="filter-header">
            <h2>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest News'}
            </h2>
            <div className="filter-buttons">
              <button 
                className={selectedFilter === 'all' ? 'active' : ''}
                onClick={() => setSelectedFilter('all')}
              >
                All
              </button>
              <button 
                className={selectedFilter === 'trending' ? 'active' : ''}
                onClick={() => setSelectedFilter('trending')}
              >
                Trending
              </button>
              <button 
                className={selectedFilter === 'latest' ? 'active' : ''}
                onClick={() => setSelectedFilter('latest')}
              >
                Latest
              </button>
              {categoriesData.slice(0, 6).map(category => (
                <button 
                  key={category.id}
                  className={selectedFilter === category.name ? 'active' : ''}
                  onClick={() => setSelectedFilter(category.name)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="articles-grid">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <div className="no-articles">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* Trending Sidebar */}
        {!searchQuery && (
          <aside className="trending-sidebar">
            <h3>Trending Now</h3>
            <div className="trending-list">
              {trendingArticles.slice(0, 5).map(article => (
                <div key={article.id} className="trending-item">
                  <h4 className="trending-title">
                    <Link href={`/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h4>
                  <span className="trending-views">
                    {article.views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Categories Overview */}
        {!searchQuery && (
          <section className="categories-section">
            <h2>Explore Categories</h2>
            <div className="categories-grid">
              {categoriesData.map(category => (
                <div 
                  key={category.id}
                  className="category-card"
                  style={{ borderColor: category.color }}
                >
                  <Link href={`/category/${category.name.toLowerCase()}`}>
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className="article-count">{category.articleCount} articles</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;

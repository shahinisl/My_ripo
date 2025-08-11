'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import articlesData from '../data/articles.json';
import categoriesData from '../data/categories.json';

interface CategoryPageProps {
  categoryName: string;
  currentUser: any;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryName, currentUser }) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    // Find the category data
    const foundCategory = categoriesData.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    setCategory(foundCategory);

    if (categoryName) {
      let categoryArticles = articlesData.filter(article => 
        article.category.toLowerCase() === categoryName.toLowerCase()
      );

      // Sort articles
      categoryArticles.sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === 'views') {
          return b.views - a.views;
        } else if (sortBy === 'likes') {
          return b.likes - a.likes;
        }
        return 0;
      });

      setArticles(categoryArticles);
    }
  }, [categoryName, sortBy]);

  if (!category) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="loading">Loading category...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          
          <div className="category-title">
            <h1>{category.icon} {category.name}</h1>
            <p>{category.description}</p>
          </div>
          
          <div className="category-stats">
            <span>{articles.length} articles</span>
          </div>
        </div>

        <div className="category-controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        <div className="category-articles">
          {articles.length > 0 ? (
            articles.map(article => (
              <div key={article.id} className="category-article">
                <div className="article-image">
                  <img 
                    src={article.image || '/images/placeholder.jpg'} 
                    alt={article.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="article-content">
                  <h3>
                    <Link href={`/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p>{article.summary}</p>
                  <div className="article-meta">
                    <span>By {article.author}</span>
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-articles">
              <h3>No articles found in this category</h3>
              <p>Check back later for new content!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

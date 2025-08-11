'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import articlesData from '../data/articles.json';
import usersData from '../data/users.json';
import commentsData from '../data/comments.json';

interface ArticlePageProps {
  articleId: number;
  currentUser: any;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ articleId, currentUser }) => {
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const foundArticle = articlesData.find(a => a.id === articleId);
    if (foundArticle) {
      setArticle(foundArticle);
      const foundAuthor = usersData.find(u => u.id === foundArticle.authorId);
      setAuthor(foundAuthor);
      
      const articleComments = commentsData.filter(c => c.articleId === articleId);
      setComments(articleComments);
    }
  }, [articleId]);

  const handleReaction = (type: 'like' | 'dislike') => {
    if (!currentUser) {
      alert('Please login to react to articles');
      return;
    }
    
    if (userReaction === type) {
      setUserReaction(null);
    } else {
      setUserReaction(type);
    }
  };

  const handleBookmark = () => {
    if (!currentUser) {
      alert('Please login to bookmark articles');
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!currentUser && !isAnonymous) {
      alert('Please login or choose to comment anonymously');
      return;
    }

    const comment = {
      id: comments.length + 1,
      articleId: articleId,
      userId: isAnonymous ? null : currentUser?.id,
      author: isAnonymous ? 'Anonymous' : currentUser?.name,
      content: newComment,
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      anonymous: isAnonymous
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleCommentReaction = (commentId: number, type: 'like' | 'dislike') => {
    if (!currentUser) {
      alert('Please login to react to comments');
      return;
    }
    
    // This would typically update the backend
    console.log(`Reacting to comment ${commentId} with ${type}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ));
  };

  if (!article || !author) {
    return (
      <div className="article-page">
        <div className="container">
          <div className="loading">Loading article...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="container">
        <article className="full-article">
          {/* Article Header */}
          <header className="article-header">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href={`/category/${article.category.toLowerCase()}`}>
                {article.category}
              </Link>
              <span>/</span>
              <span>Article</span>
            </div>

            <h1 className="article-title">{article.title}</h1>
            
            <div className="article-summary">
              <p>{article.summary}</p>
            </div>

            <div className="article-meta">
              <div className="author-section">
                <img 
                  src={author.profileImage || '/images/default-avatar.jpg'} 
                  alt={author.name}
                  className="author-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                  }}
                />
                <div className="author-info">
                  <Link href={`/profile/${author.id}`} className="author-name">
                    {author.name}
                    {author.verified && <span className="verified">✓</span>}
                  </Link>
                  <div className="author-details">
                    <span className="author-role">{author.role}</span>
                    <span className="article-date">{formatDate(article.date)}</span>
                  </div>
                </div>
              </div>

              <div className="article-actions">
                <div className="reactions">
                  <button 
                    className={`reaction-button like ${userReaction === 'like' ? 'active' : ''}`}
                    onClick={() => handleReaction('like')}
                  >
                    👍 {article.likes + (userReaction === 'like' ? 1 : 0)}
                  </button>
                  <button 
                    className={`reaction-button dislike ${userReaction === 'dislike' ? 'active' : ''}`}
                    onClick={() => handleReaction('dislike')}
                  >
                    👎 {article.dislikes + (userReaction === 'dislike' ? 1 : 0)}
                  </button>
                </div>
                
                <button 
                  className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={handleBookmark}
                >
                  🔖 {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                
                <span className="views">👁️ {article.views.toLocaleString()} views</span>
              </div>
            </div>
          </header>

          {/* Article Image */}
          {article.image && (
            <div className="article-image-container">
              <img 
                src={article.image} 
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="article-content">
            {formatContent(article.content)}
          </div>

          {/* Article Tags */}
          <div className="article-tags">
            <h3>Tags:</h3>
            <div className="tags-list">
              {article.tags.map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this article..."
              rows={4}
              required
            />
            <div className="comment-options">
              <label className="anonymous-option">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                Comment anonymously
              </label>
              <button type="submit" className="submit-comment">
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div className="commenter-info">
                      <span className="commenter-name">
                        {comment.anonymous ? '👤 Anonymous' : comment.author}
                      </span>
                      <span className="comment-date">{formatDate(comment.date)}</span>
                    </div>
                    <div className="comment-actions">
                      <button 
                        onClick={() => handleCommentReaction(comment.id, 'like')}
                        className="comment-reaction"
                      >
                        👍 {comment.likes}
                      </button>
                      <button 
                        onClick={() => handleCommentReaction(comment.id, 'dislike')}
                        className="comment-reaction"
                      >
                        👎 {comment.dislikes}
                      </button>
                    </div>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Related Articles */}
        <section className="related-articles">
          <h2>Related Articles</h2>
          <div className="related-grid">
            {articlesData
              .filter(a => a.id !== article.id && a.category === article.category)
              .slice(0, 3)
              .map(relatedArticle => (
                <div 
                  key={relatedArticle.id}
                  className="related-article"
                >
                  <Link href={`/article/${relatedArticle.id}`}>
                    <img 
                      src={relatedArticle.image || '/images/placeholder.jpg'} 
                      alt={relatedArticle.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                    <h3>{relatedArticle.title}</h3>
                    <p>{relatedArticle.summary}</p>
                  </Link>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArticlePage;

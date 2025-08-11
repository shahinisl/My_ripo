'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUpload from './ImageUpload';
import articlesData from '../data/articles.json';
import pendingArticlesData from '../data/pendingArticles.json';
import usersData from '../data/users.json';
import categoriesData from '../data/categories.json';

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [articleToReject, setArticleToReject] = useState<any>(null);
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<any>(null);
  
  // Pagination states for Pending Articles
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [pendingItemsPerPage] = useState(10);
  
  // Pagination states for User Management
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersItemsPerPage] = useState(10);
  
  // Enhanced User management states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Normal User',
    bio: '',
    gender: '',
    profileImage: '',
    password: '',
    confirmPassword: ''
  });
  
  // Enhanced Profile states
  const [editableProfile, setEditableProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    gender: currentUser?.gender || '',
    profileImage: currentUser?.profileImage || ''
  });

  // Analytics Filter States
  const [analyticsFilter, setAnalyticsFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Load data
  useEffect(() => {
    setCategories(categoriesData);
    if (currentUser?.role === 'Admin') {
      setPendingArticles(pendingArticlesData);
      setAllUsers(usersData);
      
      const stats = {
        totalArticles: articlesData.length,
        pendingApproval: pendingArticlesData.length,
        totalUsers: usersData.length,
        totalViews: articlesData.reduce((sum, article) => sum + article.views, 0),
        totalCategories: categoriesData.length,
        totalRoles: 5
      };
      setPlatformStats(stats);
    }
  }, [currentUser]);

  // Article Management Functions
  const handleApproveArticle = (articleId: number) => {
    const updatedPending = pendingArticles.filter(article => article.id !== articleId);
    setPendingArticles(updatedPending);
    console.log(`Article ${articleId} approved and published`);
  };

  const openRejectModal = (article: any) => {
    setArticleToReject(article);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejectArticle = () => {
    if (!articleToReject) return;
    const updatedPending = pendingArticles.filter(article => article.id !== articleToReject.id);
    setPendingArticles(updatedPending);
    console.log(`Article "${articleToReject.title}" rejected. Reason: ${rejectionReason || 'No reason provided'}`);
    setShowRejectModal(false);
    setRejectionReason('');
    setArticleToReject(null);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setArticleToReject(null);
  };

  // Enhanced User Management Functions
  const openUserForm = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        gender: user.gender || '',
        profileImage: user.profileImage || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        role: 'Normal User',
        bio: '',
        gender: '',
        profileImage: '',
        password: '',
        confirmPassword: ''
      });
    }
    setShowUserForm(true);
  };

  const saveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!editingUser && !userForm.password) {
      alert('Password is required for new users.');
      return;
    }

    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Create userData without confirmPassword
    const { confirmPassword, ...userData } = userForm;

    if (editingUser) {
      const updatedUsers = allUsers.map(user => {
        if (user.id === editingUser.id) {
          return { ...user, ...userData };
        }
        return user;
      });
      setAllUsers(updatedUsers);
      console.log(`User ${editingUser.name} updated`);
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        verified: false,
        articlesPublished: 0,
        totalViews: 0,
        followers: 0,
        following: 0
      };
      setAllUsers([newUser, ...allUsers]);
      console.log(`New user ${newUser.name} created`);
    }
    
    setShowUserForm(false);
  };

  // Missing User Management Functions
  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users);
          console.log(`User deleted: ${userId}`);
        } else {
          alert('Failed to delete user from server.');
        }
      } catch (err) {
        // Fallback to local deletion if server is not running
        const updatedUsers = allUsers.filter(user => user.id !== userId);
        setAllUsers(updatedUsers);
        console.log(`User deleted locally: ${userId}`);
      }
    }
  };

  const toggleUserVerification = (userId: string) => {
    const updatedUsers = allUsers.map(user => {
      if (user.id === userId) {
        return { ...user, verified: !user.verified };
      }
      return user;
    });
    setAllUsers(updatedUsers);
    console.log(`User verification toggled: ${userId}`);
  };

  // View Toggle State
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  
  // User Profile Modal State
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);

  // Preview Modal Functions
  const openPreviewModal = (article: any) => {
    setPreviewArticle(article);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewArticle(null);
  };
  
  // User Profile Modal Functions
  const openUserProfileModal = (authorName: string) => {
    // Find user by name from allUsers or create a mock user profile
    const userProfile = allUsers.find(user => user.name === authorName) || {
      id: Date.now().toString(),
      name: authorName,
      email: `${authorName.toLowerCase().replace(' ', '.')}@newspaper.com`,
      role: 'Writer',
      bio: 'Passionate writer with extensive experience in journalism and content creation.',
      profileImage: '/images/default-avatar.jpg',
      verified: Math.random() > 0.5,
      articlesPublished: Math.floor(Math.random() * 50) + 5,
      totalViews: Math.floor(Math.random() * 100000) + 10000,
      followers: Math.floor(Math.random() * 5000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      specialties: ['Technology', 'Business', 'Innovation'],
      socialMedia: {
        twitter: `@${authorName.toLowerCase().replace(' ', '_')}`,
        linkedin: `linkedin.com/in/${authorName.toLowerCase().replace(' ', '-')}`,
        website: `${authorName.toLowerCase().replace(' ', '')}.com`
      },
      achievements: ['Featured Writer 2024', 'Editor\'s Choice Award', 'Top Contributor'],
      recentActivity: [
        { action: 'Published article', title: 'Latest Tech Trends', date: new Date(Date.now() - 86400000).toISOString() },
        { action: 'Updated profile', date: new Date(Date.now() - 172800000).toISOString() },
        { action: 'Joined platform', date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString() }
      ]
    };
    
    setSelectedUserProfile(userProfile);
    setShowUserProfileModal(true);
  };

  const closeUserProfileModal = () => {
    setShowUserProfileModal(false);
    setSelectedUserProfile(null);
  };

  // Pagination Helper Functions
  const getPaginatedData = (data: any[], currentPage: number, itemsPerPage: number) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getPaginationNumbers = (totalItems: number, itemsPerPage: number, currentPage: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && item !== currentPage);
  };

  const renderPagination = (totalItems: number, itemsPerPage: number, currentPage: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    
    return (
      <div className="beautiful-pagination">
        <div className="pagination-info">
          <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries</span>
        </div>
        <div className="pagination-controls">
          <button 
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          {getPaginationNumbers(totalItems, itemsPerPage, currentPage).map((page, index) => (
            <button
              key={index}
              className={`pagination-number ${page === '...' ? 'dots' : ''}`}
              onClick={() => typeof page === 'number' ? onPageChange(page) : null}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
          
          <button 
            className={`pagination-number current`}
          >
            {currentPage}
          </button>
          
          <button 
            className={`pagination-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  // Profile Update Functions
  const handleProfileSave = () => {
    if (!editableProfile.name.trim() || !editableProfile.email.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    console.log('Profile updated:', editableProfile);
    alert('Profile updated successfully!');
  };

  // Generate analytics data
  const generateAnalyticsData = (filter: string) => {
    const baseData = {
      totalArticles: articlesData.length,
      totalUsers: allUsers.length,
      totalViews: articlesData.reduce((sum, article) => sum + article.views, 0),
      pendingArticles: pendingArticles.length,
      featuredArticles: articlesData.filter(a => a.featured).length,
      verifiedUsers: allUsers.filter(u => u.verified).length,
      activeWriters: allUsers.filter(u => u.articlesPublished > 0).length,
      totalFollowers: allUsers.reduce((sum, u) => sum + u.followers, 0),
      totalCategories: categories.length
    };

    // Generate time-based data based on filter
    let timeData: any[] = [];
    if (filter === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      timeData = months.map(month => ({
        period: month,
        articles: Math.floor(Math.random() * 50) + 10,
        views: Math.floor(Math.random() * 10000) + 1000,
        users: Math.floor(Math.random() * 100) + 20,
        engagement: Math.floor(Math.random() * 15) + 5
      }));
    } else if (filter === 'yearly') {
      const years = ['2020', '2021', '2022', '2023', '2024'];
      timeData = years.map(year => ({
        period: year,
        articles: Math.floor(Math.random() * 500) + 100,
        views: Math.floor(Math.random() * 100000) + 10000,
        users: Math.floor(Math.random() * 1000) + 200,
        engagement: Math.floor(Math.random() * 25) + 10
      }));
    } else {
      // Weekly data for custom/default
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      timeData = weeks.map(week => ({
        period: week,
        articles: Math.floor(Math.random() * 15) + 5,
        views: Math.floor(Math.random() * 5000) + 500,
        users: Math.floor(Math.random() * 50) + 10,
        engagement: Math.floor(Math.random() * 20) + 5
      }));
    }

    return {
      ...baseData,
      timeData,
      topCategories: [
        { name: 'Technology', articles: 45, views: 125000, growth: 15 },
        { name: 'Business', articles: 32, views: 98000, growth: 8 },
        { name: 'World News', articles: 28, views: 156000, growth: 22 },
        { name: 'Sports', articles: 25, views: 87000, growth: -3 },
        { name: 'Entertainment', articles: 22, views: 76000, growth: 12 }
      ]
    };
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        if (currentUser.role === 'Admin') {
          return (
            <div className="dashboard-overview admin-overview">
              <h2>Platform Overview - Admin Dashboard</h2>
              <div className="admin-stats-grid">
                <div className="stat-card admin-stat">
                  <h3>Total Articles</h3>
                  <p className="stat-number">{platformStats.totalArticles}</p>
                  <span className="stat-label">Published</span>
                </div>
                <div className="stat-card admin-stat pending">
                  <h3>Pending Approval</h3>
                  <p className="stat-number">{platformStats.pendingApproval}</p>
                  <span className="stat-label">Awaiting Review</span>
                </div>
                <div className="stat-card admin-stat">
                  <h3>Total Users</h3>
                  <p className="stat-number">{platformStats.totalUsers}</p>
                  <span className="stat-label">Registered</span>
                </div>
                <div className="stat-card admin-stat">
                  <h3>Platform Views</h3>
                  <p className="stat-number">{platformStats.totalViews?.toLocaleString()}</p>
                  <span className="stat-label">All Time</span>
                </div>
                <div className="stat-card admin-stat">
                  <h3>User Roles</h3>
                  <p className="stat-number">{platformStats.totalRoles}</p>
                  <span className="stat-label">Active</span>
                </div>
              </div>

              <div className="admin-quick-actions">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('pending')}
                  >
                    📋 Review Articles ({platformStats.pendingApproval})
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('users')}
                  >
                    👥 Manage Users
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('analytics')}
                  >
                    📈 View Analytics
                  </button>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="dashboard-overview">
              <h2>Welcome back, {currentUser.name}!</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Articles Published</h3>
                  <p className="stat-number">{currentUser.articlesPublished}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Views</h3>
                  <p className="stat-number">{currentUser.totalViews.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                  <h3>Followers</h3>
                  <p className="stat-number">{currentUser.followers.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                  <h3>Following</h3>
                  <p className="stat-number">{currentUser.following}</p>
                </div>
              </div>
              
              <div className="admin-quick-actions">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('write')}
                  >
                    ✍️ Write Article
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('articles')}
                  >
                    📚 My Articles
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('profile')}
                  >
                    👤 Edit Profile
                  </button>
                </div>
              </div>
            </div>
          );
        }

      case 'profile':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
              <p className="text-gray-600">Manage your profile information and preferences</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Profile Image Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h3>
                <ImageUpload
                  currentImage={editableProfile.profileImage}
                  onImageChange={(imageData) => {
                    setEditableProfile({
                      ...editableProfile, 
                      profileImage: imageData.data
                    });
                  }}
                  size="large"
                  className="mb-6"
                />
                
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    🔒 Change Password
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
                
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      value={editableProfile.name}
                      onChange={(e) => setEditableProfile({...editableProfile, name: e.target.value})}
                      placeholder="Full Name" 
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      value={editableProfile.email}
                      onChange={(e) => setEditableProfile({...editableProfile, email: e.target.value})}
                      placeholder="Email" 
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={editableProfile.gender}
                      onChange={(e) => setEditableProfile({...editableProfile, gender: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea 
                      placeholder="Tell us about yourself..." 
                      rows={4}
                      value={editableProfile.bio}
                      onChange={(e) => setEditableProfile({...editableProfile, bio: e.target.value})}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-6">
                    <button 
                      onClick={handleProfileSave}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <span>💾</span>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'write':
        return (
          <div className="dashboard-write">
            <h2>Write New Article</h2>
            {currentUser.role === 'Normal User' ? (
              <div className="upgrade-notice">
                <p>You need to be a Writer or Journalist to publish articles.</p>
                <p>Contact support to upgrade your account.</p>
              </div>
            ) : (
              <div className="write-form">
                <input type="text" placeholder="Article Title" className="title-input" />
                <select className="category-select">
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <textarea 
                  placeholder="Write your article summary..." 
                  className="summary-textarea"
                  rows={3}
                />
                <textarea 
                  placeholder="Write your article content..." 
                  className="content-textarea"
                  rows={15}
                />
                <div className="form-actions">
                  <button className="save-draft">Save Draft</button>
                  <button className="publish">Publish Article</button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'articles':
        // Mock articles data for demonstration
        const mockArticles = currentUser.articlesPublished === 0 ? [] : [
          {
            id: 1,
            title: "The Future of Artificial Intelligence in Healthcare",
            status: "Published",
            category: "Technology",
            publishedDate: "2024-01-08",
            views: 2543,
            likes: 89,
            comments: 23,
            readTime: "5 min read",
            tags: ["AI", "Healthcare", "Technology"],
            summary: "Exploring how artificial intelligence is revolutionizing healthcare delivery and patient outcomes.",
            thumbnail: "/images/ai-healthcare.jpg"
          },
          {
            id: 2,
            title: "Sustainable Living: Small Changes, Big Impact",
            status: "Draft",
            category: "Environment",
            createdDate: "2024-01-06",
            views: 0,
            likes: 0,
            comments: 0,
            readTime: "3 min read",
            tags: ["Sustainability", "Environment", "Lifestyle"],
            summary: "Simple everyday changes that can make a significant difference for our planet.",
            thumbnail: "/images/sustainable-living.jpg"
          },
          {
            id: 3,
            title: "Remote Work Revolution: Productivity Tips",
            status: "Under Review",
            category: "Business",
            submittedDate: "2024-01-05",
            views: 156,
            likes: 12,
            comments: 5,
            readTime: "7 min read",
            tags: ["Remote Work", "Productivity", "Business"],
            summary: "Essential strategies for maintaining productivity while working from home.",
            thumbnail: "/images/remote-work.jpg"
          },
          {
            id: 4,
            title: "The Art of Minimalist Design",
            status: "Published",
            category: "Design",
            publishedDate: "2024-01-03",
            views: 1789,
            likes: 67,
            comments: 18,
            readTime: "4 min read",
            tags: ["Design", "Minimalism", "UX"],
            summary: "Understanding the principles and benefits of minimalist design in modern applications.",
            thumbnail: "/images/minimalist-design.jpg"
          },
          {
            id: 5,
            title: "Cryptocurrency Market Analysis 2024",
            status: "Draft",
            category: "Finance",
            createdDate: "2024-01-02",
            views: 0,
            likes: 0,
            comments: 0,
            readTime: "8 min read",
            tags: ["Cryptocurrency", "Finance", "Investment"],
            summary: "Comprehensive analysis of cryptocurrency trends and market predictions.",
            thumbnail: "/images/crypto-analysis.jpg"
          }
        ];

        return (
          <div className="articles-dashboard-redesign">
            {/* Modern Header with Gradient */}
            <div className="articles-hero-header">
              <div className="hero-background-pattern">
                <div className="pattern-grid"></div>
                <div className="floating-elements">
                  <div className="element element-1">📝</div>
                  <div className="element element-2">✨</div>
                  <div className="element element-3">📊</div>
                  <div className="element element-4">🚀</div>
                </div>
              </div>
              
              <div className="hero-content-wrapper">
                <div className="hero-main-content">
                  <div className="title-section">
                    <div className="icon-badge">
                      <div className="icon-inner">📚</div>
                      <div className="icon-ring"></div>
                    </div>
                    <div className="title-text">
                      <h1 className="main-heading">
                        My Articles
                        <span className="highlight-dot"></span>
                      </h1>
                      <p className="sub-heading">Create, manage, and analyze your content portfolio</p>
                    </div>
                  </div>
                  
                  <div className="hero-actions">
                    <button className="primary-cta-btn" onClick={() => setActiveTab('write')}>
                      <div className="btn-bg-gradient"></div>
                      <div className="btn-content">
                        <span className="btn-icon">✍️</span>
                        <span className="btn-text">Create Article</span>
                      </div>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <button className="secondary-btn">
                      <span className="btn-icon">📈</span>
                      <span className="btn-text">Analytics</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Stats Overview */}
                <div className="stats-overview-redesign">
                  <div className="stats-card stat-published">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">✅</div>
                    </div>
                    <div className="stat-data">
                      <div className="stat-number">{mockArticles.filter(a => a.status === 'Published').length}</div>
                      <div className="stat-label">Published</div>
                    </div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 10 + 5)}%</div>
                  </div>
                  
                  <div className="stats-card stat-drafts">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">📝</div>
                    </div>
                    <div className="stat-data">
                      <div className="stat-number">{mockArticles.filter(a => a.status === 'Draft').length}</div>
                      <div className="stat-label">Drafts</div>
                    </div>
                    <div className="stat-trend neutral">Ready</div>
                  </div>
                  
                  <div className="stats-card stat-views">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">👀</div>
                    </div>
                    <div className="stat-data">
                      <div className="stat-number">{(mockArticles.reduce((sum, a) => sum + a.views, 0) / 1000).toFixed(1)}K</div>
                      <div className="stat-label">Total Views</div>
                    </div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 15 + 8)}%</div>
                  </div>
                  
                  <div className="stats-card stat-engagement">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">💝</div>
                    </div>
                    <div className="stat-data">
                      <div className="stat-number">{mockArticles.reduce((sum, a) => sum + a.likes, 0)}</div>
                      <div className="stat-label">Likes</div>
                    </div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 12 + 6)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Management Area */}
            <div className="content-management-area">
              {mockArticles.length === 0 ? (
                <div className="empty-state-modern">
                  <div className="empty-visual">
                    <div className="empty-main-icon">🎯</div>
                    <div className="empty-particles">
                      <span className="particle p1">✨</span>
                      <span className="particle p2">💫</span>
                      <span className="particle p3">⭐</span>
                      <span className="particle p4">🌟</span>
                    </div>
                  </div>
                  <div className="empty-content">
                    <h2 className="empty-heading">Ready to Share Your Story?</h2>
                    <p className="empty-text">
                      Your writing journey starts here. Create compelling articles that engage, inform, and inspire your audience.
                    </p>
                    <div className="empty-cta-section">
                      <button className="cta-primary" onClick={() => setActiveTab('write')}>
                        <span className="cta-icon">🚀</span>
                        <span className="cta-text">Start Writing</span>
                        <div className="cta-shimmer"></div>
                      </button>
                      <button className="cta-secondary">
                        <span className="cta-icon">📖</span>
                        <span className="cta-text">Browse Templates</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Advanced Filter System */}
                  <div className="filter-control-panel">
                    <div className="filter-tabs-modern">
                      <button className="filter-tab-modern active">
                        <span className="tab-indicator"></span>
                        <span className="tab-content">
                          <span className="tab-icon">📋</span>
                          <span className="tab-text">All Articles</span>
                          <span className="tab-count">{mockArticles.length}</span>
                        </span>
                      </button>
                      <button className="filter-tab-modern">
                        <span className="tab-indicator"></span>
                        <span className="tab-content">
                          <span className="tab-icon">✅</span>
                          <span className="tab-text">Published</span>
                          <span className="tab-count">{mockArticles.filter(a => a.status === 'Published').length}</span>
                        </span>
                      </button>
                      <button className="filter-tab-modern">
                        <span className="tab-indicator"></span>
                        <span className="tab-content">
                          <span className="tab-icon">📝</span>
                          <span className="tab-text">Drafts</span>
                          <span className="tab-count">{mockArticles.filter(a => a.status === 'Draft').length}</span>
                        </span>
                      </button>
                      <button className="filter-tab-modern">
                        <span className="tab-indicator"></span>
                        <span className="tab-content">
                          <span className="tab-icon">⏳</span>
                          <span className="tab-text">Review</span>
                          <span className="tab-count">{mockArticles.filter(a => a.status === 'Under Review').length}</span>
                        </span>
                      </button>
                    </div>
                    
                    <div className="filter-controls">
                      <div className="search-control">
                        <div className="search-icon">🔍</div>
                        <input 
                          type="search" 
                          placeholder="Search articles by title, category, or tags..."
                          className="search-input-modern"
                        />
                      </div>
                      
                      <div className="sort-control">
                        <select className="sort-select-modern">
                          <option value="recent">📅 Most Recent</option>
                          <option value="popular">🔥 Most Popular</option>
                          <option value="views">👀 Most Viewed</option>
                          <option value="likes">❤️ Most Liked</option>
                          <option value="alphabetical">🔤 A-Z</option>
                        </select>
                      </div>
                      
                      <div className="view-toggle">
                        <button className="view-btn active" title="Grid View">
                          <span className="view-icon">▦</span>
                        </button>
                        <button className="view-btn" title="List View">
                          <span className="view-icon">☰</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Premium Articles Grid */}
                  <div className="articles-grid-premium">
                    {mockArticles.map((article, index) => (
                      <article key={article.id} className="article-card-premium" style={{animationDelay: `${index * 0.1}s`}}>
                        {/* Card Header */}
                        <div className="card-header-section">
                          <div className="article-image-container">
                            <div className="article-image-placeholder">
                              <div className="image-icon">🎨</div>
                              <div className="image-overlay">
                                <button className="overlay-btn">
                                  <span className="overlay-icon">👁️</span>
                                </button>
                              </div>
                            </div>
                            <div className="image-gradient"></div>
                          </div>
                          
                          <div className={`status-indicator status-${article.status.toLowerCase().replace(' ', '-')}`}>
                            <div className="status-dot"></div>
                            <span className="status-text">{article.status}</span>
                          </div>
                          
                          <div className="article-badges">
                            <span className="category-badge">
                              <span className="badge-icon">🏷️</span>
                              {article.category}
                            </span>
                            <span className="reading-time-badge">
                              <span className="badge-icon">⏱️</span>
                              {article.readTime}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="card-body-section">
                          <h3 className="article-title-modern">{article.title}</h3>
                          <p className="article-excerpt">{article.summary}</p>
                          
                          <div className="article-tags-modern">
                            {article.tags.slice(0, 4).map((tag, idx) => (
                              <span key={idx} className="tag-chip">
                                #{tag}
                              </span>
                            ))}
                            {article.tags.length > 4 && (
                              <span className="tag-more">+{article.tags.length - 4}</span>
                            )}
                          </div>
                        </div>

                        {/* Card Stats */}
                        <div className="card-stats-section">
                          <div className="stats-row">
                            <div className="stat-item-modern">
                              <span className="stat-icon">👁️</span>
                              <span className="stat-value">{article.views.toLocaleString()}</span>
                            </div>
                            <div className="stat-item-modern">
                              <span className="stat-icon">💝</span>
                              <span className="stat-value">{article.likes}</span>
                            </div>
                            <div className="stat-item-modern">
                              <span className="stat-icon">💬</span>
                              <span className="stat-value">{article.comments}</span>
                            </div>
                            <div className="stat-item-modern date-stat">
                              <span className="stat-icon">📅</span>
                              <span className="stat-value">
                                {article.status === 'Published' 
                                  ? new Date(article.publishedDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  : article.status === 'Under Review'
                                    ? new Date(article.submittedDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : new Date(article.createdDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="card-actions-section">
                          <div className="primary-actions-row">
                            <button className="action-btn-modern edit" title="Edit Article">
                              <span className="btn-icon">✏️</span>
                              <span className="btn-text">Edit</span>
                              <div className="btn-ripple"></div>
                            </button>
                            
                            {article.status === 'Published' ? (
                              <button className="action-btn-modern view" title="View Article">
                                <span className="btn-icon">🔗</span>
                                <span className="btn-text">View</span>
                                <div className="btn-ripple"></div>
                              </button>
                            ) : article.status === 'Draft' ? (
                              <button className="action-btn-modern publish" title="Publish Article">
                                <span className="btn-icon">🚀</span>
                                <span className="btn-text">Publish</span>
                                <div className="btn-ripple"></div>
                              </button>
                            ) : (
                              <button className="action-btn-modern pending" disabled>
                                <span className="btn-icon">⏳</span>
                                <span className="btn-text">Pending</span>
                              </button>
                            )}
                            
                            <div className="more-actions">
                              <button className="more-btn" title="More Options">
                                <span className="more-icon">⋯</span>
                              </button>
                              <div className="more-menu">
                                <button className="menu-item">
                                  <span className="menu-icon">📊</span>
                                  <span className="menu-text">Analytics</span>
                                </button>
                                <button className="menu-item">
                                  <span className="menu-icon">📋</span>
                                  <span className="menu-text">Duplicate</span>
                                </button>
                                <button className="menu-item">
                                  <span className="menu-icon">🔗</span>
                                  <span className="menu-text">Share</span>
                                </button>
                                <button className="menu-item delete">
                                  <span className="menu-icon">🗑️</span>
                                  <span className="menu-text">Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Hover Effects */}
                        <div className="card-hover-effect"></div>
                        <div className="card-border-glow"></div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      
      case 'pending':
        if (currentUser.role !== 'Admin') return <div>Access Denied</div>;
        const paginatedPendingArticles = getPaginatedData(pendingArticles, pendingCurrentPage, pendingItemsPerPage);
        
        return (
          <div className="admin-pending-enhanced">
            {/* Premium Header Design */}
            <div className="pending-hero-section">
              <div className="hero-background">
                <div className="floating-shapes">
                  <div className="shape shape-1"></div>
                  <div className="shape shape-2"></div>
                  <div className="shape shape-3"></div>
                </div>
              </div>
              
              <div className="hero-content">
                <div className="hero-main">
                  <div className="hero-icon-container">
                    <div className="hero-icon">
                      <svg viewBox="0 0 24 24" className="icon-svg">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 2h2v2h-2V5zm0 4h2v6h-2V9z"/>
                      </svg>
                    </div>
                    <div className="icon-pulse"></div>
                  </div>
                  
                  <div className="hero-text">
                    <h1 className="hero-title">
                      Articles Pending Review
                      {/* <span className="title-accent">✨</span> */}
                    </h1>
                    <p className="hero-subtitle">
                      Carefully review and manage submitted articles with our advanced moderation tools
                    </p>
                  </div>
                </div>
                
                <div className="hero-stats">
                  <div className="stat-card-hero">
                    <div className="stat-value">{pendingArticles.length}</div>
                    <div className="stat-label">Pending Articles</div>
                    <div className="stat-indicator"></div>
                  </div>
                  
                  <div className="stat-card-hero">
                    <div className="stat-value">{Math.ceil(pendingArticles.length / pendingItemsPerPage)}</div>
                    <div className="stat-label">Pages</div>
                    <div className="stat-indicator"></div>
                  </div>
                  
                  <div className="quick-actions-hero">
                    <button className="quick-btn filter-btn">
                      <span className="btn-icon">🔍</span>
                      <span>Filter</span>
                    </button>
                    <button className="quick-btn sort-btn">
                      <span className="btn-icon">📊</span>
                      <span>Sort</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Articles Container */}
            <div className="articles-workspace">
              {pendingArticles.length === 0 ? (
                <div className="empty-state-premium">
                  <div className="empty-illustration">
                    <div className="empty-circle">
                      <div className="empty-icon">🎉</div>
                      <div className="empty-sparkles">
                        <span className="sparkle">✨</span>
                        <span className="sparkle">⭐</span>
                        <span className="sparkle">💫</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="empty-title">All Articles Reviewed!</h3>
                  <p className="empty-description">
                    Great job! There are no articles pending approval at the moment.
                    New submissions will appear here automatically.
                  </p>
                  <div className="empty-actions">
                    <button className="empty-btn primary">
                      <span className="btn-icon">📝</span>
                      View Published Articles
                    </button>
                    <button className="empty-btn secondary">
                      <span className="btn-icon">📊</span>
                      View Analytics
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Filter and Sort Bar */}
                  <div className="workspace-toolbar">
                    <div className="toolbar-left">
                      <div className="view-toggle">
                        <button 
                          className={`toggle-btn ${currentView === 'grid' ? 'active' : ''}`}
                          onClick={() => setCurrentView('grid')}
                        >
                          <span className="btn-icon">🔲</span>
                          Grid View
                        </button>
                        <button 
                          className={`toggle-btn ${currentView === 'list' ? 'active' : ''}`}
                          onClick={() => setCurrentView('list')}
                        >
                          <span className="btn-icon">📄</span>
                          List View
                        </button>
                      </div>
                      
                      <div className="filters">
                        <select className="filter-select">
                          <option>All Categories</option>
                          <option>Technology</option>
                          <option>Business</option>
                          <option>Sports</option>
                          <option>Entertainment</option>
                        </select>
                        
                        <select className="filter-select">
                          <option>All Authors</option>
                          <option>John Smith</option>
                          <option>Jane Doe</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="toolbar-right">
                      <div className="search-box">
                        <input 
                          type="search" 
                          placeholder="Search articles..." 
                          className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                      </div>
                      
                      <div className="bulk-actions">
                        <button className="bulk-btn approve-all">
                          <span className="btn-icon">✅</span>
                          Approve All
                        </button>
                        <button className="bulk-btn reject-all">
                          <span className="btn-icon">❌</span>
                          Bulk Reject
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Articles Grid or List */}
                  <div className={`articles-container-premium ${currentView === 'list' ? 'list-view' : 'grid-view'}`}>
                    {paginatedPendingArticles.map((article, index) => (
                      <div key={article.id} className={`article-card-premium ${currentView === 'list' ? 'article-card-list' : 'article-card-grid'}`} style={{animationDelay: `${index * 0.1}s`}}>
                        {/* Card Header with Status */}
                        <div className="card-header-premium">
                          <div className="status-indicators">
                            <div className="priority-dot high"></div>
                            <div className="status-badge new">New</div>
                          </div>
                          
                          <div className="submission-info">
                            <span className="submission-date">
                              <span className="date-icon">📅</span>
                              {new Date(article.submittedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <div className="reading-time">
                              <span className="time-icon">⏱️</span>
                              {article.content ? Math.ceil(article.content.split(' ').length / 200) : 3} min read
                            </div>
                          </div>
                        </div>
                        
                        {/* Article Preview Section */}
                        <div className="article-preview-section">
                          <div className="article-thumbnail">
                            <div className="thumbnail-placeholder">
                              <div className="thumbnail-icon">📰</div>
                              <div className="thumbnail-overlay">
                                <button 
                                  className="preview-quick-btn"
                                  onClick={() => openPreviewModal(article)}
                                >
                                  <span className="btn-icon">👁️</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="article-details">
                            <div className="article-header">
                              <div className="article-header" style={{position: 'relative'}}>
                                <div className="category-tag category-badge-green" style={{position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2}}>
                                  <span className="category-icon">🏷️</span>
                                  {article.category}
                                </div>
                                <h3 className="article-title-premium">
                                  {article.title}
                                  <span className="title-indicator">📝</span>
                                </h3>
                                <div className="article-meta-premium">
                                  <div className="author-tag">
                                    <div className="author-avatar">
                                      <span className="avatar-initial">{article.author.charAt(0)}</span>
                                    </div>
                                    <span className="author-name">{article.author}</span>
                                    <span className="verified-badge">✓</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="article-summary-premium">
                              <p className="summary-text">{article.summary}</p>
                              <div className="summary-gradient"></div>
                            </div>
                            
                            <div className="article-stats">
                              <div className="stat-item">
                                <span className="stat-icon">📝</span>
                                <span className="stat-value">{article.content ? article.content.split(' ').length : 'N/A'}</span>
                                <span className="stat-label">Words</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-icon">🏷️</span>
                                <span className="stat-value">{article.tags.length}</span>
                                <span className="stat-label">Tags</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-icon">📊</span>
                                <span className="stat-value">A+</span>
                                <span className="stat-label">Quality</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags Section */}
                        <div className="tags-section-premium">
                          <div className="tags-container-premium">
                            {article.tags.slice(0, 4).map((tag: string) => (
                              <span key={tag} className="tag-premium">
                                <span className="tag-hash">#</span>
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 4 && (
                              <span className="tag-more">+{article.tags.length - 4}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="actions-section-premium">
                          <div className="primary-actions">
                            <button 
                              className="action-btn-premium preview-btn"
                              onClick={() => openPreviewModal(article)}
                              title="Preview Full Article"
                            >
                              <div className="btn-content">
                                <span className="btn-icon">👁️</span>
                                <span className="btn-text">Preview</span>
                              </div>
                              <div className="btn-shine"></div>
                            </button>
                            
                            <button 
                              className="action-btn-premium approve-btn"
                              onClick={() => handleApproveArticle(article.id)}
                              title="Approve and Publish"
                            >
                              <div className="btn-content">
                                <span className="btn-icon">✅</span>
                                <span className="btn-text">Approve</span>
                              </div>
                              <div className="btn-shine"></div>
                            </button>
                            
                            <button 
                              className="action-btn-premium reject-btn"
                              onClick={() => openRejectModal(article)}
                              title="Reject Article"
                            >
                              <div className="btn-content">
                                <span className="btn-icon">❌</span>
                                <span className="btn-text">Reject</span>
                              </div>
                              <div className="btn-shine"></div>
                            </button>
                          </div>
                          
                          <div className="secondary-actions">
                            <button className="action-btn-secondary" title="Add to Favorites">
                              <span className="btn-icon">⭐</span>
                            </button>
                            <button className="action-btn-secondary" title="Schedule Review">
                              <span className="btn-icon">⏰</span>
                            </button>
                            <button className="action-btn-secondary" title="More Options">
                              <span className="btn-icon">⚙️</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Card Footer with Progress */}
                        <div className="card-footer-premium">
                          <div className="review-progress">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{width: '60%'}}></div>
                            </div>
                            <span className="progress-text">Review Progress</span>
                          </div>
                          
                          <div className="quick-stats">
                            <span className="quick-stat">📈 High Priority</span>
                            <span className="quick-stat">🔥 Trending Topic</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Enhanced Pagination */}
                  <div className="pagination-section-premium">
                    {renderPagination(
                      pendingArticles.length,
                      pendingItemsPerPage,
                      pendingCurrentPage,
                      setPendingCurrentPage
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'users':
        if (currentUser.role !== 'Admin') return <div>Access Denied</div>;
        const paginatedUsers = getPaginatedData(allUsers, usersCurrentPage, usersItemsPerPage);
        
        return (
          <div className="admin-users">
            {/* Stylish Header */}
            <div className="user-management-header">
              <div className="header-content">
                <div className="header-icon-wrapper">
                  <div className="header-icon">👥</div>
                  <div className="icon-glow"></div>
                </div>
                <div className="header-text">
                  <h1 className="main-title">User Management</h1>
                  <p className="subtitle">Manage your platform's community with style</p>
                </div>
              </div>
              <button className="add-user-btn" onClick={() => openUserForm()}>
                <span className="btn-icon">✨</span>
                <span className="btn-text">Add New User</span>
                <div className="btn-shimmer"></div>
              </button>
            </div>
            
            {/* Beautiful Stats Cards */}
            <div className="user-stats-section">
              <div className="stats-grid">
                <div className="stat-card-modern total">
                  <div className="stat-icon">👤</div>
                  <div className="stat-content">
                    <div className="stat-number">{allUsers.length}</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 20 + 5)}% this month</div>
                  </div>
                  <div className="stat-background"></div>
                </div>
                
                <div className="stat-card-modern writers">
                  <div className="stat-icon">✍️</div>
                  <div className="stat-content">
                    <div className="stat-number">{allUsers.filter(u => ['Writer', 'Journalist', 'Publisher'].includes(u.role)).length}</div>
                    <div className="stat-label">Writers & Journalists</div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 15 + 3)}% this month</div>
                  </div>
                  <div className="stat-background"></div>
                </div>
                
                <div className="stat-card-modern verified">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-number">{allUsers.filter(u => u.verified).length}</div>
                    <div className="stat-label">Verified Users</div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 10 + 2)}% this month</div>
                  </div>
                  <div className="stat-background"></div>
                </div>
                
                <div className="stat-card-modern active">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <div className="stat-number">{allUsers.filter(u => u.articlesPublished > 0).length}</div>
                    <div className="stat-label">Active Publishers</div>
                    <div className="stat-trend positive">+{Math.floor(Math.random() * 12 + 1)}% this month</div>
                  </div>
                  <div className="stat-background"></div>
                </div>
              </div>
            </div>
            
            {/* Enhanced User Cards with Pagination */}
            <div className="users-grid-modern">
              {paginatedUsers.map(user => (
                <div key={user.id} className="user-card-modern">
                  <div className="card-background">
                    <div className="bg-pattern"></div>
                    <div className="bg-gradient"></div>
                  </div>
                  
                  <div className="user-header">
                    <div className="avatar-container">
                      <img 
                        src={user.profileImage || '/images/default-avatar.jpg'} 
                        alt={user.name}
                        className="user-avatar-modern"
                      />
                      <div className="avatar-ring"></div>
                      {user.verified && (
                        <div className="verified-badge">
                          <span className="verified-icon">✓</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="user-info-modern">
                      <h3 className="user-name">{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                      <div className="user-role-badge role-{user.role.toLowerCase().replace(' ', '-')}">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-metrics">
                    <div className="metric-item">
                      <span className="metric-icon">📝</span>
                      <span className="metric-value">{user.articlesPublished}</span>
                      <span className="metric-label">Articles</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">👁️</span>
                      <span className="metric-value">{user.totalViews.toLocaleString()}</span>
                      <span className="metric-label">Views</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">👥</span>
                      <span className="metric-value">{user.followers.toLocaleString()}</span>
                      <span className="metric-label">Followers</span>
                    </div>
                  </div>
                  
                  <div className="user-actions-modern">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => openUserForm(user)}
                      title="Edit User"
                    >
                      <span className="btn-icon">✏️</span>
                      <span className="btn-text">Edit</span>
                      <div className="btn-ripple"></div>
                    </button>
                    
                    <button 
                      className={`action-btn verify-btn ${user.verified ? 'verified' : 'unverified'}`}
                      onClick={() => toggleUserVerification(user.id)}
                      title={user.verified ? 'Remove Verification' : 'Verify User'}
                    >
                      <span className="btn-icon">{user.verified ? '🔓' : '✅'}</span>
                      <span className="btn-text">{user.verified ? 'Unverify' : 'Verify'}</span>
                      <div className="btn-ripple"></div>
                    </button>
                    
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => deleteUser(user.id)}
                      title="Delete User"
                    >
                      <span className="btn-icon">🗑️</span>
                      <span className="btn-text">Delete</span>
                      <div className="btn-ripple"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination for Users */}
            {renderPagination(
              allUsers.length,
              usersItemsPerPage,
              usersCurrentPage,
              setUsersCurrentPage
            )}
          </div>
        );

      case 'analytics':
        if (currentUser.role !== 'Admin') return <div>Access Denied</div>;
        const analyticsData = generateAnalyticsData(analyticsFilter);
        return (
          <div className="admin-analytics">
            {/* Beautiful Header */}
            <div className="analytics-hero-header">
              <div className="hero-gradient">
                <div className="hero-content">
                  <div className="hero-icon">📊</div>
                  <h1 className="hero-title">Platform Analytics Dashboard</h1>
                  <p className="hero-subtitle">Comprehensive insights into your platform's performance</p>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <span className="stat-value">{analyticsData.totalArticles}</span>
                      <span className="stat-label">Articles</span>
                    </div>
                    <div className="hero-stat">
                      <span className="stat-value">{Math.round(analyticsData.totalViews / 1000)}K</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="hero-stat">
                      <span className="stat-value">{analyticsData.totalUsers}</span>
                      <span className="stat-label">Users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="analytics-filters">
              <div className="filter-group">
                <label>📅 Time Period:</label>
                <div className="filter-buttons">
                  <button 
                    className={analyticsFilter === 'weekly' ? 'active' : ''}
                    onClick={() => setAnalyticsFilter('weekly')}
                  >
                    📅 Weekly
                  </button>
                  <button 
                    className={analyticsFilter === 'monthly' ? 'active' : ''}
                    onClick={() => setAnalyticsFilter('monthly')}
                  >
                    📆 Monthly
                  </button>
                  <button 
                    className={analyticsFilter === 'yearly' ? 'active' : ''}
                    onClick={() => setAnalyticsFilter('yearly')}
                  >
                    🗓️ Yearly
                  </button>
                  <button 
                    className={analyticsFilter === 'custom' ? 'active' : ''}
                    onClick={() => {
                      setAnalyticsFilter('custom');
                      setShowCustomDatePicker(!showCustomDatePicker);
                    }}
                  >
                    🎯 Custom Range
                  </button>
                </div>
              </div>
              
              {showCustomDatePicker && (
                <div className="custom-date-picker">
                  <input 
                    type="date" 
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                    placeholder="Start Date"
                  />
                  <span>to</span>
                  <input 
                    type="date" 
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                    placeholder="End Date"
                  />
                  <button className="apply-filter">Apply Filters</button>
                </div>
              )}
            </div>

            {/* Enhanced Key Metrics */}
            <div className="enhanced-metrics-grid">
              <div className="metric-card primary glow-effect">
                <div className="metric-header">
                  <div className="metric-icon pulse">📝</div>
                  <div className="metric-badge">Content</div>
                </div>
                <div className="metric-body">
                  <h3>{analyticsData.totalArticles.toLocaleString()}</h3>
                  <p>Total Articles</p>
                  <div className="metric-details">
                    <span className="detail-item">📋 {analyticsData.pendingArticles} Pending</span>
                    <span className="detail-item">⭐ {analyticsData.featuredArticles} Featured</span>
                  </div>
                </div>
                <div className="metric-trend positive">+12% ↗</div>
              </div>
              
              <div className="metric-card secondary glow-effect">
                <div className="metric-header">
                  <div className="metric-icon pulse">👀</div>
                  <div className="metric-badge">Engagement</div>
                </div>
                <div className="metric-body">
                  <h3>{analyticsData.totalViews.toLocaleString()}</h3>
                  <p>Total Views</p>
                  <div className="metric-details">
                    <span className="detail-item">📊 {Math.round(analyticsData.totalViews/analyticsData.totalArticles)} Avg/Article</span>
                    <span className="detail-item">🔥 {Math.round(analyticsData.totalViews/30)} Daily Avg</span>
                  </div>
                </div>
                <div className="metric-trend positive">+18% ↗</div>
              </div>
              
              <div className="metric-card tertiary glow-effect">
                <div className="metric-header">
                  <div className="metric-icon pulse">👥</div>
                  <div className="metric-badge">Community</div>
                </div>
                <div className="metric-body">
                  <h3>{analyticsData.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                  <div className="metric-details">
                    <span className="detail-item">✅ {analyticsData.verifiedUsers} Verified</span>
                    <span className="detail-item">✍️ {analyticsData.activeWriters} Writers</span>
                  </div>
                </div>
                <div className="metric-trend positive">+8% ↗</div>
              </div>
              
              <div className="metric-card quaternary glow-effect">
                <div className="metric-header">
                  <div className="metric-icon pulse">📈</div>
                  <div className="metric-badge">Growth</div>
                </div>
                <div className="metric-body">
                  <h3>{analyticsData.totalFollowers.toLocaleString()}</h3>
                  <p>Total Followers</p>
                  <div className="metric-details">
                    <span className="detail-item">📂 {analyticsData.totalCategories} Categories</span>
                    <span className="detail-item">💫 {Math.round(analyticsData.totalFollowers/analyticsData.totalUsers)} Avg/User</span>
                  </div>
                </div>
                <div className="metric-trend negative">-2% ↘</div>
              </div>
            </div>

            {/* Chart Analysis Section */}
            <div className="chart-analysis-grid">
              {/* Time Series Chart */}
              <div className="chart-container full-width">
                <div className="chart-header">
                  <h3>📈 Performance Trends</h3>
                  <div className="chart-controls">
                    <button className="chart-btn active">📊 Articles</button>
                    <button className="chart-btn">👀 Views</button>
                    <button className="chart-btn">👥 Users</button>
                    <button className="chart-btn">💬 Engagement</button>
                  </div>
                </div>
                <div className="chart-area">
                  <div className="time-series-chart">
                    {analyticsData.timeData.map((data: any, index: number) => (
                      <div key={index} className="chart-bar-group">
                        <div className="chart-bars">
                          <div 
                            className="chart-bar articles"
                            style={{height: `${(data.articles / Math.max(...analyticsData.timeData.map((d: any) => d.articles))) * 100}%`}}
                            title={`${data.articles} articles`}
                          />
                          <div 
                            className="chart-bar views"
                            style={{height: `${(data.views / Math.max(...analyticsData.timeData.map((d: any) => d.views))) * 60}%`}}
                            title={`${data.views.toLocaleString()} views`}
                          />
                          <div 
                            className="chart-bar users"
                            style={{height: `${(data.users / Math.max(...analyticsData.timeData.map((d: any) => d.users))) * 80}%`}}
                            title={`${data.users} users`}
                          />
                        </div>
                        <div className="chart-label">{data.period}</div>
                        <div className="chart-values">
                          <span className="chart-value">📝 {data.articles}</span>
                          <span className="chart-value">👀 {data.views.toLocaleString()}</span>
                          <span className="chart-value">👥 {data.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div className="chart-container medium">
                <div className="chart-header">
                  <h3>🏆 Top Categories</h3>
                  <span className="chart-subtitle">Performance & Growth Analysis</span>
                </div>
                <div className="category-rankings enhanced">
                  {analyticsData.topCategories.map((category: any, index: number) => (
                    <div key={index} className="category-rank-item enhanced">
                      <div className="rank-badge">
                        <span className="rank-number">#{index + 1}</span>
                        <div className="rank-crown">{index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</div>
                      </div>
                      <div className="category-info expanded">
                        <h4>{category.name}</h4>
                        <div className="category-stats">
                          <div className="stat-item">
                            <span className="stat-icon">📝</span>
                            <span className="stat-text">{category.articles} articles</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-icon">👀</span>
                            <span className="stat-text">{category.views.toLocaleString()} views</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-icon">📊</span>
                            <span className="stat-text">{Math.round(category.views/category.articles).toLocaleString()} avg/article</span>
                          </div>
                        </div>
                        <div className="category-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{width: `${(category.views / Math.max(...analyticsData.topCategories.map((c: any) => c.views))) * 100}%`}}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="category-metrics">
                        <div className={`growth-indicator large ${category.growth >= 0 ? 'positive' : 'negative'}`}>
                          <span className="growth-arrow">{category.growth >= 0 ? '↗️' : '↘️'}</span>
                          <span className="growth-value">{category.growth >= 0 ? '+' : ''}{category.growth}%</span>
                          <span className="growth-label">Growth</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Engagement Analysis */}
              <div className="chart-container medium">
                <div className="chart-header">
                  <h3>👥 User Engagement Analysis</h3>
                  <span className="chart-subtitle">Deep dive into user behavior</span>
                </div>
                <div className="engagement-analysis">
                  <div className="engagement-metrics">
                    <div className="engagement-item">
                      <div className="engagement-icon">👍</div>
                      <div className="engagement-data">
                        <h4>8,542</h4>
                        <p>Total Likes</p>
                        <span className="engagement-trend positive">+15%</span>
                      </div>
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">👎</div>
                      <div className="engagement-data">
                        <h4>542</h4>
                        <p>Total Dislikes</p>
                        <span className="engagement-trend negative">-8%</span>
                      </div>
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">💬</div>
                      <div className="engagement-data">
                        <h4>3,721</h4>
                        <p>Comments</p>
                        <span className="engagement-trend positive">+22%</span>
                      </div>
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">🔖</div>
                      <div className="engagement-data">
                        <h4>2,156</h4>
                        <p>Bookmarks</p>
                        <span className="engagement-trend positive">+11%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-behavior-chart">
                    <h4>📊 User Activity Patterns</h4>
                    <div className="activity-heatmap">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="heatmap-day">
                          <span className="day-label">{day}</span>
                          <div className="activity-bars">
                            {[...Array(24)].map((_, hour) => (
                              <div 
                                key={hour}
                                className={`activity-bar intensity-${Math.floor(Math.random() * 5) + 1}`}
                                title={`${hour}:00 - ${Math.floor(Math.random() * 100 + 20)} users active`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual User Analysis */}
              <div className="chart-container full-width">
                <div className="chart-header">
                  <h3>🔍 Individual User Analysis</h3>
                  <div className="chart-controls">
                    <input 
                      type="search" 
                      placeholder="🔍 Search user by name or email..." 
                      className="user-search"
                    />
                    <select className="user-filter">
                      <option value="all">All Users</option>
                      <option value="writers">Writers & Journalists</option>
                      <option value="verified">Verified Users</option>
                      <option value="active">Most Active</option>
                    </select>
                  </div>
                </div>
                <div className="user-analysis-grid">
                  {allUsers.slice(0, 6).map((user: any) => (
                    <div key={user.id} className="user-analysis-card">
                      <div className="user-card-header">
                        <img 
                          src={user.profileImage || '/images/default-avatar.jpg'} 
                          alt={user.name}
                          className="user-avatar-small"
                        />
                        <div className="user-info-compact">
                          <h4>{user.name} {user.verified && <span className="verified-badge">✅</span>}</h4>
                          <p className="user-role-badge">{user.role}</p>
                        </div>
                        <div className="user-score">
                          <span className="score-value">{85 + Math.floor(Math.random() * 15)}</span>
                          <span className="score-label">Score</span>
                        </div>
                      </div>
                      
                      <div className="user-metrics-grid">
                        <div className="user-metric">
                          <div className="metric-icon-small">📝</div>
                          <div className="metric-data-small">
                            <span className="metric-value-small">{user.articlesPublished}</span>
                            <span className="metric-label-small">Articles</span>
                          </div>
                        </div>
                        <div className="user-metric">
                          <div className="metric-icon-small">👀</div>
                          <div className="metric-data-small">
                            <span className="metric-value-small">{user.totalViews.toLocaleString()}</span>
                            <span className="metric-label-small">Views</span>
                          </div>
                        </div>
                        <div className="user-metric">
                          <div className="metric-icon-small">👥</div>
                          <div className="metric-data-small">
                            <span className="metric-value-small">{user.followers.toLocaleString()}</span>
                            <span className="metric-label-small">Followers</span>
                          </div>
                        </div>
                        <div className="user-metric">
                          <div className="metric-icon-small">❤️</div>
                          <div className="metric-data-small">
                            <span className="metric-value-small">{50 + Math.floor(Math.random() * 200)}</span>
                            <span className="metric-label-small">Likes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="user-engagement-chart">
                        <div className="engagement-bars">
                          <div className="engagement-bar" style={{height: `${Math.random() * 80 + 20}%`}} title="Articles" />
                          <div className="engagement-bar" style={{height: `${Math.random() * 80 + 20}%`}} title="Views" />
                          <div className="engagement-bar" style={{height: `${Math.random() * 80 + 20}%`}} title="Likes" />
                          <div className="engagement-bar" style={{height: `${Math.random() * 80 + 20}%`}} title="Comments" />
                        </div>
                      </div>
                      
                      <div className="user-actions-analytics">
                        <button className="action-btn view-profile">👤 View Profile</button>
                        <button className="action-btn view-articles">📚 Articles</button>
                        <button className="action-btn view-analytics">📊 Analytics</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab not found</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-required">
        <h2>Please login to access the dashboard</h2>
        <Link href="/login" className="login-button">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Manage your content and settings</p>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              🏠 Overview
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            {currentUser.role !== 'Normal User' && (
              <>
                <button 
                  className={activeTab === 'write' ? 'active' : ''}
                  onClick={() => setActiveTab('write')}
                >
                  ✍️ Write
                </button>
                <button 
                  className={activeTab === 'articles' ? 'active' : ''}
                  onClick={() => setActiveTab('articles')}
                >
                  📚 Articles
                </button>
              </>
            )}
            {currentUser.role === 'Admin' && (
              <>
                <button 
                  className={activeTab === 'pending' ? 'active' : ''}
                  onClick={() => setActiveTab('pending')}
                >
                  📋 Pending ({pendingArticles.length})
                </button>
                <button 
                  className={activeTab === 'users' ? 'active' : ''}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Users
                </button>
                <button 
                  className={activeTab === 'analytics' ? 'active' : ''}
                  onClick={() => setActiveTab('analytics')}
                >
                  📊 Analytics
                </button>
              </>
            )}
            <button onClick={onLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>

          <div className="dashboard-main">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Article</h3>
            <p>Are you sure you want to reject "{articleToReject?.title}"?</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Optional: Provide a reason for rejection..."
              rows={3}
            />
            <div className="modal-actions">
              <button onClick={closeRejectModal}>Cancel</button>
              <button onClick={confirmRejectArticle} className="reject-btn">
                Reject Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-content enhanced-user-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="title-icon">{editingUser ? '✏️' : '✨'}</div>
                <h3>{editingUser ? 'Edit User Profile' : 'Create New User'}</h3>
                <p>Complete user information and profile details</p>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowUserForm(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Profile Photo Section */}
              <div className="profile-photo-section">
                <h4>📸 Profile Photo</h4>
                <div className="photo-upload-area">
                  <div className="current-photo">
                    <img 
                      src={userForm.profileImage || '/images/default-avatar.jpg'} 
                      alt="Profile preview"
                      className="photo-preview"
                    />
                    <div className="photo-overlay">
                      <span>Click to change</span>
                    </div>
                  </div>
                  
                  <div className="photo-options">
                    <div className="upload-methods">
                      <label className="upload-btn">
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{display: 'none'}}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setUserForm({...userForm, profileImage: event.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        📁 Upload Image
                      </label>
                      
                      <div className="url-input-group">
                        <input 
                          type="url"
                          placeholder="🔗 Or paste image URL"
                          value={userForm.profileImage.startsWith('data:') ? '' : userForm.profileImage}
                          onChange={(e) => setUserForm({...userForm, profileImage: e.target.value})}
                          className="url-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <h4>👤 Personal Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      placeholder="Enter full name"
                      className="styled-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      placeholder="Enter email address"
                      className="styled-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userForm.gender}
                      onChange={(e) => setUserForm({...userForm, gender: e.target.value})}
                      className="styled-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>User Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="styled-select role-select"
                    >
                      <option value="Normal User">👤 Normal User</option>
                      <option value="Writer">✍️ Writer</option>
                      <option value="Journalist">📰 Journalist</option>
                      <option value="Publisher">📚 Publisher</option>
                      <option value="Admin">👑 Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Bio</label>
                  <textarea 
                    value={userForm.bio}
                    onChange={(e) => setUserForm({...userForm, bio: e.target.value})}
                    placeholder="Tell us about this user..."
                    rows={4}
                    className="styled-textarea"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="form-section">
                <h4>🔐 {editingUser ? 'Change Password (Optional)' : 'Password Setup'}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Password {!editingUser && '*'}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                      className="styled-input"
                    />
                  </div>
                  
                  {userForm.password && (
                    <div className="form-group">
                      <label>Confirm Password {!editingUser && '*'}</label>
                      <input
                        type="password"
                        value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                        placeholder="Confirm password"
                        className="styled-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowUserForm(false)}
              >
                ❌ Cancel
              </button>
              <button 
                className="save-btn primary"
                onClick={saveUser}
              >
                <span className="btn-icon">{editingUser ? '💾' : '✨'}</span>
                <span>{editingUser ? 'Update User' : 'Create User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {showPreviewModal && previewArticle && (
  <div className="modal-overlay preview-modal-overlay redesigned-preview-modal israel-modal-fullwidth" onClick={closePreviewModal}>
          <div className="modal-content preview-modal-content redesigned-modal-card israel-modal-content-fullwidth" onClick={(e) => e.stopPropagation()}>
            {/* Modern Glassy Header with Icon and Gradient */}
            <div className="preview-modal-header redesigned-header">
              <div className="header-bg-gradient"></div>
              <div className="header-content-flex">
                <div className="header-icon-glass">
                  <span className="icon-eye">👁️</span>
                </div>
                <div className="header-titles">
                  <h2 className="modal-title-hero redesigned-title">Articles Pending Review</h2>
                  <p className="modal-subtitle redesigned-subtitle">Editorial preview & decision panel</p>
                </div>
                <button 
                  className="preview-close-btn redesigned-close-btn israel-close-topright"
                  onClick={closePreviewModal}
                  aria-label="Close Preview"
                  style={{ position: 'absolute', top: 52, right: 281, background: 'rgb(229, 57, 53)', color: 'rgb(255, 255, 255)', borderRadius: '50%', width: 40, height: 40, fontSize: 22, fontWeight: 700, boxShadow: '0 2px 8px rgba(229,57,53,0.15)', border: 'none', zIndex: 10, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#b71c1c')}
                  onMouseOut={e => (e.currentTarget.style.background = '#e53935')}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="preview-modal-body redesigned-body">
              {/* Article Card Meta */}
              <div className="redesigned-meta-card">
                <div className="meta-flex-row">
                  <div className="meta-main-info">
                    <h3 className="meta-title">{previewArticle.title}</h3>
                    <div className="meta-author-row">
                      <span className="meta-label">By</span>
                      <span className="meta-value clickable-author redesigned-author-link" title="View author profile" onClick={() => openUserProfileModal(previewArticle.author)}>{previewArticle.author}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-label">{previewArticle.category}</span>
                    </div>
                    <div className="meta-date-row">
                      <span className="meta-label">Submitted:</span>
                      <span className="meta-value">{new Date(previewArticle.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="meta-tags-list">
                    {previewArticle.tags.map((tag: string) => (
                      <span key={tag} className="meta-tag redesigned-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Article Summary Card */}
              <div className="redesigned-section-card summary-card">
                <div className="section-header">
                  <span className="section-icon">📋</span>
                  <span className="section-title">Summary</span>
                </div>
                <div className="section-content">
                  <p className="summary-text">{previewArticle.summary}</p>
                </div>
              </div>

              {/* Full Article Content Card */}
              <div className="redesigned-section-card content-card">
                <div className="section-header">
                  <span className="section-icon">📖</span>
                  <span className="section-title">Full Content</span>
                </div>
                <div className="section-content">
                  <div className="content-wrapper">
                    {previewArticle.content ? (
                      <div className="formatted-content redesigned-content-block">
                        {previewArticle.content.split('\n').map((paragraph: string, index: number) => (
                          paragraph.trim() ? (
                            <p key={index} className="content-paragraph redesigned-paragraph">{paragraph}</p>
                          ) : (
                            <br key={index} />
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="no-content-message redesigned-no-content">
                        <div className="no-content-icon">📄</div>
                        <p>No full content available for this article.</p>
                        <p className="content-note">Only summary and metadata are provided.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Article Stats Card - New Attractive Layout */}
              <div className="redesigned-section-card stats-card israel-stats-card">
                <div className="israel-stats-header">
                  <span className="section-icon big">📊</span>
                  <span className="section-title israel-title">Statistics</span>
                </div>
                <div className="israel-stats-grid">
                  <div className="israel-stat-item">
                    <div className="israel-stat-icon">📝</div>
                    <div className="israel-stat-value">{previewArticle.content ? previewArticle.content.split(' ').length : 'N/A'}</div>
                    <div className="israel-stat-label">Words</div>
                  </div>
                  <div className="israel-stat-item">
                    <div className="israel-stat-icon">⏱️</div>
                    <div className="israel-stat-value">{previewArticle.content ? Math.ceil(previewArticle.content.split(' ').length / 200) : 'N/A'}</div>
                    <div className="israel-stat-label">Min Read</div>
                  </div>
                  <div className="israel-stat-item">
                    <div className="israel-stat-icon">🏷️</div>
                    <div className="israel-stat-value">{previewArticle.tags.length}</div>
                    <div className="israel-stat-label">Tags</div>
                  </div>
                  <div className="israel-stat-item">
                    <div className="israel-stat-icon">📊</div>
                    <div className="israel-stat-value status-new">New</div>
                    <div className="israel-stat-label">Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions Modernized - Israel Style */}
            <div className="preview-modal-footer redesigned-footer israel-footer">
              <div className="footer-actions redesigned-footer-actions israel-footer-actions">
                <button 
                  className="preview-action-btn reject-btn redesigned-reject-btn israel-reject-btn"
                  onClick={() => {
                    closePreviewModal();
                    openRejectModal(previewArticle);
                  }}
                  title="Reject Article"
                >
                  <span className="btn-icon">❌</span>
                  <span className="btn-text">Reject</span>
                </button>

                <span className="israel-btn-space"></span>

                <button 
                  className="preview-action-btn approve-btn redesigned-approve-btn israel-approve-btn"
                  onClick={() => {
                    handleApproveArticle(previewArticle.id);
                    closePreviewModal();
                  }}
                  title="Approve and Publish"
                >
                  <span className="btn-icon">✅</span>
                  <span className="btn-text">Approve & Publish</span>
                </button>

                <span className="israel-btn-space"></span>

                <button 
                  className="preview-action-btn close-btn redesigned-close-btn israel-close-btn"
                  onClick={closePreviewModal}
                >
                  <span className="btn-icon">👁️</span>
                  <span className="btn-text">Close Preview</span>
                </button>
              </div>

              <div className="footer-info redesigned-footer-info israel-footer-info">
                <div className="review-tips redesigned-tips israel-tips">
                  <span className="tips-icon">💡</span>
                  <span>Review content carefully before making a decision</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* User Profile Modal */}
      {showUserProfileModal && selectedUserProfile && (
        <div className="modal-overlay user-profile-modal-overlay" onClick={closeUserProfileModal}>
          <div className="modal-content user-profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-profile-modal-header">
              <div className="profile-header-background">
                <div className="profile-gradient"></div>
                <div className="profile-pattern"></div>
              </div>
              
              <div className="profile-header-content">
                <div className="profile-avatar-section">
                  <div className="avatar-container-large">
                    <img 
                      src={selectedUserProfile.profileImage || '/images/default-avatar.jpg'} 
                      alt={selectedUserProfile.name}
                      className="profile-avatar-large"
                    />
                    <div className="avatar-ring-large"></div>
                    {selectedUserProfile.verified && (
                      <div className="verified-badge-large">
                        <span className="verified-icon-large">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="profile-basic-info">
                    <h2 className="profile-name">{selectedUserProfile.name}</h2>
                    <p className="profile-email">{selectedUserProfile.email}</p>
                    <div className="profile-role-badge">
                      <span className="role-icon">👤</span>
                      <span className="role-text">{selectedUserProfile.role}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="profile-close-btn"
                  onClick={closeUserProfileModal}
                  aria-label="Close Profile"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="user-profile-modal-body">
              {/* Profile Statistics */}
              <div className="profile-stats-section">
                <h3 className="section-title">
                  <span className="section-icon">📊</span>
                  Profile Statistics
                </h3>
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <div className="stat-icon-circle">
                      <span className="stat-icon">📝</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{selectedUserProfile.articlesPublished}</div>
                      <div className="stat-label">Articles Published</div>
                    </div>
                  </div>
                  
                  <div className="profile-stat-card">
                    <div className="stat-icon-circle">
                      <span className="stat-icon">👁️</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{selectedUserProfile.totalViews.toLocaleString()}</div>
                      <div className="stat-label">Total Views</div>
                    </div>
                  </div>
                  
                  <div className="profile-stat-card">
                    <div className="stat-icon-circle">
                      <span className="stat-icon">👥</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{selectedUserProfile.followers.toLocaleString()}</div>
                      <div className="stat-label">Followers</div>
                    </div>
                  </div>
                  
                  <div className="profile-stat-card">
                    <div className="stat-icon-circle">
                      <span className="stat-icon">🔗</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{selectedUserProfile.following}</div>
                      <div className="stat-label">Following</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* About Section */}
              <div className="profile-about-section">
                <h3 className="section-title">
                  <span className="section-icon">👤</span>
                  About
                </h3>
                <div className="profile-bio">
                  <p>{selectedUserProfile.bio}</p>
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Joined:</span>
                    <span className="detail-value">{new Date(selectedUserProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                  
                  {selectedUserProfile.specialties && (
                    <div className="detail-item">
                      <span className="detail-label">🎯 Specialties:</span>
                      <div className="specialties-list">
                        {selectedUserProfile.specialties.map((specialty: string) => (
                          <span key={specialty} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Achievements Section */}
              {selectedUserProfile.achievements && (
                <div className="profile-achievements-section">
                  <h3 className="section-title">
                    <span className="section-icon">🏆</span>
                    Achievements
                  </h3>
                  <div className="achievements-grid">
                    {selectedUserProfile.achievements.map((achievement: string, index: number) => (
                      <div key={index} className="achievement-item">
                        <div className="achievement-icon">🏅</div>
                        <span className="achievement-text">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Social Media Section */}
              {selectedUserProfile.socialMedia && (
                <div className="profile-social-section">
                  <h3 className="section-title">
                    <span className="section-icon">🌐</span>
                    Social Links
                  </h3>
                  <div className="social-links">
                    {selectedUserProfile.socialMedia.twitter && (
                      <a href={`https://twitter.com/${selectedUserProfile.socialMedia.twitter.replace('@', '')}`} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="social-link twitter">
                        <span className="social-icon">🐦</span>
                        <span className="social-text">{selectedUserProfile.socialMedia.twitter}</span>
                      </a>
                    )}
                    
                    {selectedUserProfile.socialMedia.linkedin && (
                      <a href={`https://${selectedUserProfile.socialMedia.linkedin}`} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="social-link linkedin">
                        <span className="social-icon">💼</span>
                        <span className="social-text">LinkedIn Profile</span>
                      </a>
                    )}
                    
                    {selectedUserProfile.socialMedia.website && (
                      <a href={`https://${selectedUserProfile.socialMedia.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="social-link website">
                        <span className="social-icon">🌐</span>
                        <span className="social-text">Personal Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Recent Activity */}
              {selectedUserProfile.recentActivity && (
                <div className="profile-activity-section">
                  <h3 className="section-title">
                    <span className="section-icon">🔄</span>
                    Recent Activity
                  </h3>
                  <div className="activity-timeline">
                    {selectedUserProfile.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="activity-item">
                        <div className="activity-dot"></div>
                        <div className="activity-content">
                          <div className="activity-action">{activity.action}</div>
                          {activity.title && <div className="activity-title">{activity.title}</div>}
                          <div className="activity-date">{new Date(activity.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-profile-modal-footer">
              <div className="footer-actions">
                {currentUser.role === 'Admin' && (
                  <>
                    <button 
                      className="profile-action-btn edit-btn"
                      onClick={() => {
                        closeUserProfileModal();
                        openUserForm(selectedUserProfile);
                      }}
                    >
                      <span className="btn-icon">✏️</span>
                      <span className="btn-text">Edit Profile</span>
                    </button>
                    
                    <button 
                      className={`profile-action-btn verify-btn ${selectedUserProfile.verified ? 'verified' : 'unverified'}`}
                      onClick={() => {
                        toggleUserVerification(selectedUserProfile.id);
                        setSelectedUserProfile({...selectedUserProfile, verified: !selectedUserProfile.verified});
                      }}
                    >
                      <span className="btn-icon">{selectedUserProfile.verified ? '🔓' : '✅'}</span>
                      <span className="btn-text">{selectedUserProfile.verified ? 'Unverify' : 'Verify'}</span>
                    </button>
                  </>
                )}
                
                <button 
                  className="profile-action-btn close-btn"
                  onClick={closeUserProfileModal}
                >
                  <span className="btn-icon">👁️</span>
                  <span className="btn-text">Close Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

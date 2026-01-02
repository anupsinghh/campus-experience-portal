import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModals } from '../context/AuthModalContext.jsx';
import { adminAPI, announcementsAPI } from '../services/api.js';
import UserMenu from './UserMenu.jsx';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, initializing, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModals();
  const [pendingCount, setPendingCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch pending experiences count for admin
  useEffect(() => {
    if (!initializing && isAuthenticated && user?.role === 'admin') {
      const fetchPendingCount = async () => {
        try {
          const response = await adminAPI.getStats();
          if (response.success && response.data) {
            setPendingCount(response.data.experiences?.pending || 0);
          }
        } catch (error) {
          console.error('Error fetching pending count:', error);
        }
      };
      fetchPendingCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [initializing, isAuthenticated, user]);

  // Fetch announcements for all users (students, alumni, etc.)
  useEffect(() => {
    if (!initializing && isAuthenticated) {
      const fetchAnnouncements = async () => {
        try {
          const response = await announcementsAPI.getAnnouncements();
          console.log('Announcements response:', response);
          if (response && response.success && response.data) {
            const announcementsData = Array.isArray(response.data) ? response.data : [];
            setAnnouncements(announcementsData);
            setAnnouncementsCount(announcementsData.length);
          } else if (Array.isArray(response)) {
            // Handle case where response is directly an array
            setAnnouncements(response);
            setAnnouncementsCount(response.length);
          } else if (response && response.data && Array.isArray(response.data)) {
            setAnnouncements(response.data);
            setAnnouncementsCount(response.data.length);
          }
        } catch (error) {
          console.error('Error fetching announcements:', error);
        }
      };
      fetchAnnouncements();
      // Refresh every 60 seconds
      const interval = setInterval(fetchAnnouncements, 60000);
      return () => clearInterval(interval);
    }
  }, [initializing, isAuthenticated]);

  // Close announcements dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAnnouncements && !event.target.closest('.announcements-dropdown') && !event.target.closest('button[onClick*="setShowAnnouncements"]')) {
        setShowAnnouncements(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAnnouncements]);

  return (
    <div className="layout">
      <header className={`header ${isHome ? 'header-fixed' : ''}`}>
        <div className="container">
          <div className="nav-shell">
            <Link to="/" className="logo">
              <h1>Placement Portal</h1>
            </Link>
            <nav className="nav">
              {initializing ? (
                // Show minimal nav during initialization
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                </div>
              ) : isHome && !isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className="nav-link nav-button-ghost"
                    onClick={openRegister}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    className="nav-link nav-button-ghost"
                    onClick={openLogin}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  {isAuthenticated && user?.role === 'admin' ? (
                    <>
                      <Link 
                        to="/admin?tab=overview" 
                        className={`nav-link ${location.pathname === '/admin' && (!location.search || location.search.includes('tab=overview') || !location.search.includes('tab=')) ? 'active' : ''}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Overview
                      </Link>
                      <Link 
                        to="/admin?tab=moderation" 
                        className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=moderation') ? 'active' : ''}`}
                        style={{ position: 'relative' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Moderation
                        {pendingCount > 0 && (
                          <span className="nav-notification-badge">{pendingCount}</span>
                        )}
                      </Link>
                      <Link 
                        to="/admin?tab=reports" 
                        className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=reports') ? 'active' : ''}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Reports
                      </Link>
                      <Link 
                        to="/admin?tab=announcements" 
                        className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=announcements') ? 'active' : ''}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        Announcements
                      </Link>
                      <Link 
                        to="/admin?tab=companies" 
                        className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=companies') ? 'active' : ''}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Companies
                      </Link>
                      <Link 
                        to="/admin?tab=users" 
                        className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=users') ? 'active' : ''}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/" className="nav-link">Home</Link>
                      <Link to="/experiences" className="nav-link">Experiences</Link>
                      {isAuthenticated && (
                        <Link to="/create" className="nav-link">Share Experience</Link>
                      )}
                      <Link to="/insights" className="nav-link">Insights</Link>
                      {isAuthenticated && (
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className="nav-link"
                            onClick={() => setShowAnnouncements(!showAnnouncements)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '4px' }}>
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Announcements
                            {announcementsCount > 0 && (
                              <span className="nav-notification-badge">{announcementsCount}</span>
                            )}
                          </button>
                          {showAnnouncements && (
                            <div className="announcements-dropdown">
                              <div className="announcements-dropdown-header">
                                <h3>Announcements</h3>
                                <button onClick={() => setShowAnnouncements(false)}>×</button>
                              </div>
                              <div className="announcements-dropdown-content">
                                {announcements.length === 0 ? (
                                  <p style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: '#64748b' }}>
                                    No announcements
                                  </p>
                                ) : (
                                  announcements.map((announcement) => (
                                    <div key={announcement._id} className="announcement-dropdown-item">
                                      <div className="announcement-dropdown-header-item">
                                        <h4>{announcement.title}</h4>
                                        <span className={`announcement-status-badge ${announcement.type}`}>
                                          {announcement.type}
                                        </span>
                                      </div>
                                      <p>{announcement.content}</p>
                                      <div className="announcement-dropdown-meta">
                                        <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
                                        {announcement.priority && (
                                          <span className={`priority-badge-small ${announcement.priority}`}>
                                            {announcement.priority}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="nav-auth">
                    {isAuthenticated ? (
                      <UserMenu user={user} onLogout={handleLogout} />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="nav-link nav-button-ghost"
                          onClick={openRegister}
                        >
                          Register
                        </button>
                        <button
                          type="button"
                          className="nav-link nav-button-ghost"
                          onClick={openLogin}
                        >
                          Login
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className={`main-content ${isHome ? 'with-fixed-header' : ''}`}>
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Placement Portal. Helping students prepare for campus placements.</p>
        </div>
      </footer>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Layout;



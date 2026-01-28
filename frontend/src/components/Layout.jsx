import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModals } from '../context/AuthModalContext.jsx';
import { adminAPI, announcementsAPI, notificationsAPI } from '../services/api.js';
import UserMenu from './UserMenu.jsx';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const { user, isAuthenticated, initializing, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModals();
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStaff = ['admin', 'coordinator', 'teacher'].includes(user?.role);

  // Fetch pending experiences count for staff (admin, coordinators, teachers)
  useEffect(() => {
    if (!initializing && isAuthenticated && isStaff) {
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
  }, [initializing, isAuthenticated, isStaff]);

  // Merged feed: fetch announcements (for dropdown) when authenticated
  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementsAPI.getAnnouncements();
        if (response?.success && Array.isArray(response.data)) setAnnouncements(response.data);
        else if (Array.isArray(response)) setAnnouncements(response);
        else if (response?.data && Array.isArray(response.data)) setAnnouncements(response.data);
      } catch (e) {
        console.error('Error fetching announcements:', e);
      }
    };
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [initializing, isAuthenticated]);

  // Comment notifications: unread count
  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const r = await notificationsAPI.getUnreadCount();
        if (r && typeof r.count === 'number') setNotificationsUnreadCount(r.count);
      } catch (e) {
        console.error('Error fetching notifications count:', e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 45000);
    return () => clearInterval(interval);
  }, [initializing, isAuthenticated]);

  // When dropdown opens: fetch comment notifications list
  useEffect(() => {
    if (!showNotifications || !isAuthenticated) return;
    const fetchList = async () => {
      try {
        const list = await notificationsAPI.getList();
        setNotifications(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error fetching notifications:', e);
      }
    };
    fetchList();
  }, [showNotifications, isAuthenticated]);

  // Close dropdown / nav drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown') && !event.target.closest('.notifications-trigger')) {
        setShowNotifications(false);
      }
      if (navOpen && !event.target.closest('.nav-drawer') && !event.target.closest('.nav-toggle')) {
        setNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, navOpen]);

  return (
    <div className="layout">
      {!isAdmin && (
        <header className={`header ${isHome ? 'header-fixed' : ''}`}>
        <div className="container">
          <div className="nav-shell">
            <Link to="/" className="logo">
              <h1>Placement Portal</h1>
            </Link>
            <nav className="nav">
              {initializing ? (
                <div className="nav-init" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="loading-spinner-nav" style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : isHome && !isAuthenticated ? (
                <div className="nav-links">
                  <button type="button" className="nav-link nav-button-ghost" onClick={openRegister}>Register</button>
                  <button type="button" className="nav-link nav-button-ghost" onClick={openLogin}>Login</button>
                </div>
              ) : (
                <>
                  <div className="nav-links nav-links-desktop">
                    {isAuthenticated && isStaff ? (
                      <>
                        <Link to="/admin?tab=overview" className={`nav-link ${location.pathname === '/admin' && (!location.search || !location.search.includes('tab=') || location.search.includes('tab=overview')) ? 'active' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                          Overview
                        </Link>
                        <Link to="/admin?tab=moderation" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=moderation') ? 'active' : ''}`} style={{ position: 'relative' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                          Moderation
                          {pendingCount > 0 && <span className="nav-notification-badge">{pendingCount}</span>}
                        </Link>
                        <Link to="/admin?tab=announcements" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=announcements') ? 'active' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                          Announcements
                        </Link>
                        <Link to="/admin?tab=companies" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=companies') ? 'active' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          Companies
                        </Link>
                        <Link to="/admin?tab=users" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=users') ? 'active' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          Users
                        </Link>
                        <Link to="/admin?tab=insights" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=insights') ? 'active' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" /></svg>
                          Insights
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin?tab=coordinators" className={`nav-link ${location.pathname === '/admin' && location.search.includes('tab=coordinators') ? 'active' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                            Coordinators
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/experiences" className="nav-link">Experiences</Link>
                        {isAuthenticated && <Link to="/create" className="nav-link">Share Experience</Link>}
                        <Link to="/insights" className="nav-link">Insights</Link>
                      </>
                    )}
                  </div>

                  <button type="button" className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                  </button>

                  <div className="nav-drawer" data-open={navOpen} aria-hidden={!navOpen}>
                    <div className="nav-drawer-overlay" onClick={() => setNavOpen(false)} />
                    <div className="nav-drawer-panel">
                      {isAuthenticated && isStaff ? (
                        <>
                          <Link to="/admin?tab=overview" className="nav-link" onClick={() => setNavOpen(false)}>Overview</Link>
                          <Link to="/admin?tab=moderation" className="nav-link" onClick={() => setNavOpen(false)}>Moderation {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}</Link>
                          <Link to="/admin?tab=announcements" className="nav-link" onClick={() => setNavOpen(false)}>Announcements</Link>
                          <Link to="/admin?tab=companies" className="nav-link" onClick={() => setNavOpen(false)}>Companies</Link>
                          <Link to="/admin?tab=users" className="nav-link" onClick={() => setNavOpen(false)}>Users</Link>
                          <Link to="/admin?tab=insights" className="nav-link" onClick={() => setNavOpen(false)}>Insights</Link>
                          {user?.role === 'admin' && <Link to="/admin?tab=coordinators" className="nav-link" onClick={() => setNavOpen(false)}>Coordinators</Link>}
                        </>
                      ) : !isHome || isAuthenticated ? (
                        <>
                          <Link to="/" className="nav-link" onClick={() => setNavOpen(false)}>Home</Link>
                          <Link to="/experiences" className="nav-link" onClick={() => setNavOpen(false)}>Experiences</Link>
                          {isAuthenticated && <Link to="/create" className="nav-link" onClick={() => setNavOpen(false)}>Share Experience</Link>}
                          <Link to="/insights" className="nav-link" onClick={() => setNavOpen(false)}>Insights</Link>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="nav-end">
                    {isAuthenticated && (
                      <div className="nav-notifications-wrap">
                        <button type="button" className="nav-link notifications-trigger" onClick={() => setShowNotifications(!showNotifications)} title="Announcements &amp; notifications">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                          Updates
                          {(announcements.length > 0 || notificationsUnreadCount > 0) && (
                            <span className="nav-notification-badge">{notificationsUnreadCount > 0 ? notificationsUnreadCount : announcements.length}</span>
                          )}
                        </button>
                        {showNotifications && (
                          <div className="notifications-dropdown">
                            <div className="notifications-dropdown-header">
                              <h3>Announcements &amp; Notifications</h3>
                              <div className="notifications-dropdown-header-actions">
                                {notificationsUnreadCount > 0 && (
                                  <button type="button" className="notifications-mark-all" onClick={async () => {
                                    try { await notificationsAPI.markAllRead(); setNotificationsUnreadCount(0); const list = await notificationsAPI.getList(); setNotifications(Array.isArray(list) ? list : []); } catch (e) { console.error(e); }
                                  }}>Mark all read</button>
                                )}
                                <button type="button" className="notifications-close-btn" onClick={() => setShowNotifications(false)} aria-label="Close">×</button>
                              </div>
                            </div>
                            <div className="notifications-dropdown-content">
                              {announcements.length === 0 && notifications.length === 0 ? (
                                <p className="notifications-empty">No announcements or comment notifications.</p>
                              ) : (
                                <>
                                  {announcements.map((a) => (
                                    <div key={`a-${a._id}`} className="notification-item notification-item-announcement">
                                      <span className="notification-type-badge">Announcement</span>
                                      <span className="notification-title">{a.title}</span>
                                      <p className="notification-desc">{a.content}</p>
                                      <span className="notification-date">{new Date(a.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                  ))}
                                  {notifications.map((n) => (
                                    <Link key={`n-${n._id}`} to={`/experiences/${n.experience?._id || n.experience}`} className={`notification-item ${n.read ? '' : 'notification-unread'}`} onClick={async () => {
                                      if (!n.read) { try { await notificationsAPI.markRead(n._id); setNotificationsUnreadCount((c) => Math.max(0, c - 1)); } catch (e) { console.error(e); } }
                                      setShowNotifications(false);
                                    }}>
                                      <span className="notification-type-badge">Comment</span>
                                      <span className="notification-title">{n.comment?.author?.name || 'Someone'} commented on your experience</span>
                                      <span className="notification-meta">{n.experience?.company} – {n.experience?.role}</span>
                                    </Link>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="nav-auth">
                      {isAuthenticated ? <UserMenu user={user} onLogout={handleLogout} /> : (
                        <>
                          <button type="button" className="nav-link nav-button-ghost" onClick={openRegister}>Register</button>
                          <button type="button" className="nav-link nav-button-ghost" onClick={openLogin}>Login</button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      )}

      <main className={`main-content ${isHome ? 'with-fixed-header' : ''} ${isAdmin ? 'admin-view' : ''}`}>
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


